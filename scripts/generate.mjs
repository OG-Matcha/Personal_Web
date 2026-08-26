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

const { status } = spawnSync('npx', ['nuxt', 'generate', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NUXT_BUILD_DIR: '.nuxt-generate' },
})

process.exit(status ?? 1)
