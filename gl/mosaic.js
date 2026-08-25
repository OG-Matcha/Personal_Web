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
 * @param {string} src        image URL (same-origin; the canvas must stay clean)
 * @param {number} maxPoints  how many particles this mosaic may recruit
 * @returns {Promise<{count:number, pos:Float32Array, rgb:Float32Array, aspect:number}|null>}
 */
export async function sampleImage(src, maxPoints) {
  let img
  try {
    img = await loadImage(src)
  } catch {
    // A missing cover must not take the whole film down with it.
    return null
  }

  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight)
  const gw = GRID_W
  const gh = Math.max(8, Math.round(GRID_W / aspect))

  const canvas = document.createElement('canvas')
  canvas.width = gw
  canvas.height = gh
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, gw, gh)

  let data
  try {
    data = ctx.getImageData(0, 0, gw, gh).data
  } catch {
    // Tainted canvas - only possible if a cover ever moves to another origin.
    return null
  }

  // ---- dominant colour, from a coarse 5-bit histogram ----------------------
  const bins = new Map()
  for (let i = 0; i < data.length; i += 4) {
    const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3)
    bins.set(key, (bins.get(key) ?? 0) + 1)
  }
  let bestKey = 0
  let bestN = -1
  for (const [k, n] of bins) {
    if (n > bestN) {
      bestN = n
      bestKey = k
    }
  }
  const bgR = ((bestKey >> 10) & 31) << 3
  const bgG = ((bestKey >> 5) & 31) << 3
  const bgB = (bestKey & 31) << 3

  // ---- rank cells by how far they are from that background ------------------
  const cells = []
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = (y * gw + x) * 4
      if (data[i + 3] < 24) continue
      const dr = data[i] - bgR
      const dg = data[i + 1] - bgG
      const db = data[i + 2] - bgB
      const energy = Math.sqrt(dr * dr + dg * dg + db * db)
      // Low on purpose. A pale admin UI is mostly hairlines and light greys;
      // at a threshold of 26 a whole calendar yielded 3,442 usable cells and
      // the mosaic came out as sparse noise.
      if (energy < 10) continue // indistinguishable from paper
      cells.push({ x, y, i, energy })
    }
  }

  if (cells.length < 64) return null
  cells.sort((a, b) => b.energy - a.energy)

  const n = Math.min(maxPoints, cells.length)
  const pos = new Float32Array(n * 2)
  const rgb = new Float32Array(n * 3)

  // Take an even stride through the ranked list rather than the top N. Taking
  // the top N alone keeps only the highest-contrast edges and loses every mid
  // tone, which reads as an outline instead of a screen.
  const stride = cells.length / n

  for (let k = 0; k < n; k++) {
    const c = cells[Math.min(cells.length - 1, Math.floor(k * stride))]
    // Centre on the image, y flipped: canvas grows down, world grows up.
    pos[k * 2] = (c.x / (gw - 1) - 0.5) * aspect
    pos[k * 2 + 1] = 0.5 - c.y / (gh - 1)
    rgb[k * 3] = data[c.i] / 255
    rgb[k * 3 + 1] = data[c.i + 1] / 255
    rgb[k * 3 + 2] = data[c.i + 2] / 255
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
  const hits = []
  // Every pixel. A wordmark drawn at 400px has enough ink to fill the pool,
  // and stepping by two threw away three quarters of it.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 128) hits.push({ x, y })
    }
  }
  if (!hits.length) return null

  const aspect = w / h
  const n = Math.min(maxPoints, hits.length)
  const stride = hits.length / n
  const pos = new Float32Array(n * 2)
  const rgb = new Float32Array(n * 3)

  for (let k = 0; k < n; k++) {
    const p = hits[Math.min(hits.length - 1, Math.floor(k * stride))]
    pos[k * 2] = (p.x / (w - 1) - 0.5) * aspect
    pos[k * 2 + 1] = 0.5 - p.y / (h - 1)
    // Zero tint means "use the palette" - type should relight with the theme,
    // unlike a screenshot, which carries its own colours.
    rgb[k * 3] = 0
    rgb[k * 3 + 1] = 0
    rgb[k * 3 + 2] = 0
  }

  return { count: n, pos, rgb, aspect }
}
