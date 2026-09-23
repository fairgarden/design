import { createRequire } from 'node:module'
import path from 'node:path'

/**
 * The same pipeline as ../postcss.config.js, so Next processes the design
 * package's src CSS (reached through the tsconfig paths alias) exactly as the
 * package build does. Turbopack reads this project-root config for every CSS
 * file, including those under ../src.
 *
 * The global-data files are passed as absolute paths, resolved here from this
 * package's own dependencies. Two things rule out the alternatives:
 * - Turbopack bundles this config before running it, so `import.meta.url`
 *   and `__dirname` point at virtual paths, not this file. Next runs the
 *   PostCSS worker in the project directory, so `process.cwd()` is this
 *   package.
 * - The plugin's own `node_modules:` prefix resolves from the parent of the
 *   working directory (it calls `createRequire(process.cwd())`, which treats
 *   the directory as a file), so it would look in ../node_modules, where the
 *   design package is not installed as a dependency of itself.
 */
const require = createRequire(path.join(process.cwd(), 'package.json'))

const config = {
  plugins: {
    'postcss-import': {},
    // Makes Open Props' custom media, e.g. (--md-n-above), and the design
    // system's own, e.g. (--ds-nav-inline-n-above), known to every file,
    // global or module, without emitting the definitions.
    '@csstools/postcss-global-data': {
      files: [
        require.resolve('open-props/media.min.css'),
        require.resolve('@fairgarden/design/src/utils/media.css'),
      ],
    },
    'postcss-custom-media': {},
  },
}

export default config
