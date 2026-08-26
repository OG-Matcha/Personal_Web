/**
 * `nuxt dev` and `nuxt generate` share one build directory.
 *
 * A generate run leaves a production server bundle in `.nuxt/dist/server/`,
 * and the next `nuxt dev` picks it up and dies on the first request with:
 *
 *   Package import specifier "#internal/nuxt/paths" is not defined
 *
 * The fix has always been `rm -rf .nuxt`, which is fine once you know - and
 * the error names neither the cause nor the cure. So this runs before dev and
 * clears the directory when it is holding a build dev cannot load.
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
