/**
 * Screenshot → point cloud.
 *
 * The naive version of this samples every pixel on a grid, which turns a
 * white-background UI screenshot into a glowing white slab: the brightest
 * thing in the film would be the paper, not the product.
 *
 * So this extracts *ink* instead. It finds the image's dominant colour - the
 * background, whatever it happens to be - and keeps only the cells that differ
 * from it, ranked by how much. What survives is the structure: type, chips,
 * chart blocks, the coloured rows of a calendar. That is also exactly what
 * still reads once it has been reduced to a few thousand dots.
 */

/**
 * Sampling grid width. Height follows the image's aspect ratio.
 *
 * 420 x ~236 is about 99,000 cells for a 16:9 source, which is what a 60,000
 * point pool needs to draw from. At 260 the grid ran out of cells before the
 * pool ran out of particles and the picture came back sparse.
 */
const GRID_W = 420

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`mosaic: cannot load ${src}`))
    img.src = src
  })
}

/**
 * Decode off the main thread, at the size we actually read.
 *
 * The covers are 1800px wide; the sampler never looks at more than a 420px
 * grid. Decoding the full frame through an <img> cost 254ms of blocked main
 * thread per picture, four times over, for pixels that were thrown away one
 * line later. `createImageBitmap` decodes on the browser's own thread pool and
 * `resizeWidth` makes it downscale there too, so the main thread gets handed a
 * bitmap that is already the right size.
 *
 * Falls back to the <img> path wherever that is not available.
 */
async function loadBitmap(src, targetWidth) {
  if (typeof createImageBitmap !== 'function') return loadImage(src)
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(String(res.status))
    // Only one of resizeWidth/resizeHeight is given, so the aspect ratio is
    // preserved for us.
    return await createImageBitmap(await res.blob(), {
      resizeWidth: targetWidth,
      resizeQuality: 'medium',
    })
  } catch {
    return loadImage(src)
  }
}

/**
 * @param {string} src        image URL (same-origin; the canvas must stay clean)
 * @param {number} maxPoints  how many particles this mosaic may recruit
 * @returns {Promise<{count:number, pos:Float32Array, rgb:Float32Array, aspect:number}|null>}
 */
export async function sampleImage(src, maxPoints) {
  let img
  try {
    img = await loadBitmap(src, GRID_W)
  } catch {
    // A missing cover must not take the whole film down with it.
    return null
  }

  // `width`/`height` read the same on an ImageBitmap and on a detached Image.
  const aspect = img.width / Math.max(1, img.height)
  const gw = GRID_W
  const gh = Math.max(8, Math.round(GRID_W / aspect))

  const canvas = document.createElement('canvas')
  canvas.width = gw
  canvas.height = gh
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, gw, gh)
  // Bitmaps hold decoded memory until closed, and there are four of them.
  img.close?.()

  let data
  try {
    data = ctx.getImageData(0, 0, gw, gh).data
  } catch {
    // Tainted canvas - only possible if a cover ever moves to another origin.
    return null
  }

  // ---- dominant colour, from a coarse 5-bit histogram ----------------------
  // A flat Int32Array beats a Map here: the key is already a 15-bit integer,
  // so the hash table buys nothing and costs one megamorphic lookup per pixel.
  const bins = new Int32Array(1 << 15)
  for (let i = 0; i < data.length; i += 4) {
    bins[((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3)]++
  }
  let bestKey = 0
  let bestN = -1
  for (let k = 0; k < bins.length; k++) {
    if (bins[k] > bestN) {
      bestN = bins[k]
      bestKey = k
    }
  }
  const bgR = ((bestKey >> 10) & 31) << 3
  const bgG = ((bestKey >> 5) & 31) << 3
  const bgB = (bestKey & 31) << 3

  // ---- rank cells by how far they are from that background ------------------
  //
  // This used to build one object per surviving cell and hand the array to
  // sort(). At 420x236 that is ~99,000 allocations and a comparator sort, and
  // it measured 684ms of blocked main thread per picture - four pictures were
  // most of the jank on first load.
  //
  // Nothing downstream needs a total order: the stride below only asks for
  // "walk the cells from most ink to least". So the energies are quantised
  // into buckets and counting-sorted, which is one pass to histogram and one
  // to place. Two typed arrays, no objects, no comparator.
  const total = gw * gh
  const BUCKETS = 512
  // Longest possible distance in RGB space, so the quantiser never clips.
  const MAX_ENERGY = Math.sqrt(3 * 255 * 255)
  const cellAt = new Uint32Array(total)
  const cellBucket = new Uint16Array(total)
  const hist = new Uint32Array(BUCKETS)

  let count = 0
  for (let px = 0; px < total; px++) {
    const i = px * 4
    if (data[i + 3] < 24) continue
    const dr = data[i] - bgR
    const dg = data[i + 1] - bgG
    const db = data[i + 2] - bgB
    const energy = Math.sqrt(dr * dr + dg * dg + db * db)
    // Low on purpose. A pale admin UI is mostly hairlines and light greys;
    // at a threshold of 26 a whole calendar yielded 3,442 usable cells and
    // the mosaic came out as sparse noise.
    if (energy < 10) continue // indistinguishable from paper
    const q = Math.min(BUCKETS - 1, (energy * ((BUCKETS - 1) / MAX_ENERGY)) | 0)
    cellAt[count] = px
    cellBucket[count] = q
    hist[q]++
    count++
  }

  if (count < 64) return null

  // Walk the buckets from most ink to least, so `ranked` comes out in
  // descending energy order. Ties keep scan order, which is arbitrary but
  // stable - and the stride below samples across the whole range anyway.
  const cursor = new Uint32Array(BUCKETS)
  let acc = 0
  for (let q = BUCKETS - 1; q >= 0; q--) {
    cursor[q] = acc
    acc += hist[q]
  }
  const ranked = new Uint32Array(count)
  for (let k = 0; k < count; k++) ranked[cursor[cellBucket[k]]++] = cellAt[k]

  const n = Math.min(maxPoints, count)
  const pos = new Float32Array(n * 2)
  const rgb = new Float32Array(n * 3)

  // Take an even stride through the ranked list rather than the top N. Taking
  // the top N alone keeps only the highest-contrast edges and loses every mid
  // tone, which reads as an outline instead of a screen.
  const stride = count / n

  for (let k = 0; k < n; k++) {
    const px = ranked[Math.min(count - 1, Math.floor(k * stride))]
    const i = px * 4
    const x = px % gw
    const y = (px / gw) | 0
    // Centre on the image, y flipped: canvas grows down, world grows up.
    pos[k * 2] = (x / (gw - 1) - 0.5) * aspect
    pos[k * 2 + 1] = 0.5 - y / (gh - 1)
    rgb[k * 3] = data[i] / 255
    rgb[k * 3 + 1] = data[i + 1] / 255
    rgb[k * 3 + 2] = data[i + 2] / 255
  }

  return { count: n, pos, rgb, aspect }
}

/**
 * Type → point cloud, for the one case that has no screenshot because it is
 * an organisation rather than a screen.
 */
export function sampleText(text, maxPoints, { font = '700 400px "Noto Serif TC", serif' } = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.font = font
  const m = ctx.measureText(text)
  const w = Math.ceil(m.width) + 80
  const h = 520
  canvas.width = w
  canvas.height = h

  // Re-assigning the size resets the context, so the font has to be set again.
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 40, h / 2)

  const data = ctx.getImageData(0, 0, w, h).data
  // Flat index list, no objects and no sort: every inked pixel is equal here,
  // so scan order is as good an order as any and the stride does the rest.
  const total = w * h
  const hits = new Uint32Array(total)
  let count = 0
  // Every pixel. A wordmark drawn at 400px has enough ink to fill the pool,
  // and stepping by two threw away three quarters of it.
  for (let px = 0; px < total; px++) {
    if (data[px * 4 + 3] > 128) hits[count++] = px
  }
  if (!count) return null

  const aspect = w / h
  const n = Math.min(maxPoints, count)
  const stride = count / n
  const pos = new Float32Array(n * 2)
  const rgb = new Float32Array(n * 3)

  for (let k = 0; k < n; k++) {
    const px = hits[Math.min(count - 1, Math.floor(k * stride))]
    pos[k * 2] = ((px % w) / (w - 1) - 0.5) * aspect
    pos[k * 2 + 1] = 0.5 - ((px / w) | 0) / (h - 1)
    // Zero tint means "use the palette" - type should relight with the theme,
    // unlike a screenshot, which carries its own colours.
    rgb[k * 3] = 0
    rgb[k * 3 + 1] = 0
    rgb[k * 3 + 2] = 0
  }

  return { count: n, pos, rgb, aspect }
}
