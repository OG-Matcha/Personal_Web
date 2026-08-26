/**
 * A fallback for a `.nuxt` that dev cannot load.
 *
 * `npm run generate` now builds into `.nuxt-generate`, so the two commands no
 * longer share a directory and the collision this guards against should not
 * happen any more. It still runs before dev because the bad state outlives the
 * fix: a checkout from before it, or someone reaching for `npx nuxt generate`
 * directly, both leave a production server bundle in `.nuxt/dist/server/` that
 * kills the next dev server on its first request with:
 *
 *   Package import specifier "#internal/nuxt/paths" is not defined
 *
 * The error names neither the cause nor the cure, so this clears it instead.
 *
 * The test is the failing import itself, not the presence of the file: dev
 * writes `dist/server/server.mjs` too, and treating that as the marker threw
 * away a usable cache on every single restart. Only the production bundle
 * carries the unresolvable specifier.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs'

const BUILD_DIR = '.nuxt'
const SERVER_BUNDLE = `${BUILD_DIR}/dist/server/server.mjs`
const BAD_IMPORT = '#internal/nuxt/paths'

if (existsSync(SERVER_BUNDLE) && readFileSync(SERVER_BUNDLE, 'utf8').includes(BAD_IMPORT)) {
  rmSync(BUILD_DIR, { recursive: true, force: true })
  console.log(`[dev] cleared ${BUILD_DIR} — it held a production build from \`nuxt generate\``)
}
