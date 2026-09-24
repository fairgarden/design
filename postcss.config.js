import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)

export default {
  plugins: {
    'postcss-import': {},
    // Makes Open Props' custom media, e.g. (--md-n-above), and the system's
    // own, e.g. (--fgd-nav-inline-n-above), known to every file, global or
    // module, without emitting the definitions.
    '@csstools/postcss-global-data': {
      files: [
        require.resolve('open-props/media.min.css'),
        fileURLToPath(new URL('./src/utils/media.css', import.meta.url)),
      ],
    },
    'postcss-custom-media': {},
  },
}
