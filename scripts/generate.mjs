/**
 * `nuxt generate` into its own build directory.
 *
 * Both commands default to `.nuxt`, so generating while a dev server is up
 * replaced that server's bundle with a production one and every request after
 * it died with `#internal/nuxt/paths is not defined`. The dev server has no
 * way to notice or recover; it just serves 500s until someone clears the
 * directory and restarts.
 *
 * nuxt.config reads NUXT_BUILD_DIR, so setting it here keeps the two builds
 * apart. It is set in this wrapper rather than inline in the npm script
 * because `VAR=value cmd` is not valid syntax in cmd.exe or PowerShell.
 */
import { spawnSync } from 'node:child_process'

// Chinese headings' phrase breaks, from the content as it is now.
spawnSync('node', ['scripts/make-keep.mjs'], { stdio: 'inherit' })

// Every Chinese character in the content must be in the webfont subset. New
// copy (the Catalyst page, a homepage blurb) once shipped 11 characters drawn
// in the system font mid-line, and nothing stopped the build.
const fonts = spawnSync('node', ['scripts/check-fonts.mjs'], { stdio: 'inherit' })
if (fonts.status !== 0) process.exit(1)

const { status } = spawnSync('npx', ['nuxt', 'generate', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NUXT_BUILD_DIR: '.nuxt-generate' },
})

process.exit(status ?? 1)
