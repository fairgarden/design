import next from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // .next*: the default distDir and the NEXT_DIST_DIR ones parallel dev servers use.
  { ignores: ['node_modules/**', '.next*/**'] },
  ...next,
  {
    // Demos show the components with plain <img> media, the way consumers
    // outside Next use them; next/image would add its own wrapper and sizing.
    files: ['app/**/demos/**'],
    rules: { '@next/next/no-img-element': 'off' },
  },
]

export default config
