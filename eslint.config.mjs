import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

/*
 * Import guardrails. `@fairgarden/docs` is an optional peer: only the
 * modules built on the docs engine (Code Block, Demo, Types Table, Search
 * Dialog and the `utils/docs` factories) may import it, so an app that never
 * imports them never needs the peer. Nothing in the package imports Next.js.
 */
const docsModules = [
  'src/content/code-block/**',
  'src/content/demo/**',
  'src/content/types-table/**',
  'src/overlays/search-dialog/**',
  'src/utils/docs/**',
]
const docsPeer = {
  message:
    '@fairgarden/docs is an optional peer: only content/code-block, content/demo, content/types-table, overlays/search-dialog and utils/docs may import it.',
}
const nextFramework = {
  message: 'The package is framework-free: pass Next.js behavior in through props (e.g. onNavigate).',
}
const docsPeerPaths = [{ name: '@fairgarden/docs', ...docsPeer }]
const docsPeerPatterns = [{ group: ['@fairgarden/docs/*'], ...docsPeer }]
const nextPaths = [{ name: 'next', ...nextFramework }]
const nextPatterns = [{ group: ['next/*'], ...nextFramework }]

// `no-restricted-imports` covers static imports and `export … from`; these
// cover `import()`.
const dynamicDocsPeer = {
  selector: 'ImportExpression[source.value=/^@fairgarden\\u002Fdocs(\\u002F|$)/]',
  ...docsPeer,
}
const dynamicNext = {
  selector: 'ImportExpression[source.value=/^next(\\u002F|$)/]',
  ...nextFramework,
}

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // docs/ is its own workspace package and lints itself
  {
    ignores: [
      'node_modules/**',
      'foundations/**',
      'actions/**',
      'navigation/**',
      'forms/**',
      'feedback/**',
      'overlays/**',
      'disclosure/**',
      'page/**',
      'content/**',
      'data/**',
      'utils/**',
      'icons/**',
      'docs/**',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': ['error'],
      'no-restricted-imports': [
        'error',
        {
          paths: [...docsPeerPaths, ...nextPaths],
          patterns: [...docsPeerPatterns, ...nextPatterns],
        },
      ],
      'no-restricted-syntax': ['error', dynamicDocsPeer, dynamicNext],
    },
  },
  // The modules built on the docs engine: the peer is allowed; Next.js still is not.
  {
    files: docsModules.flatMap((dir) => [`${dir}/*.ts`, `${dir}/*.tsx`]),
    rules: {
      'no-restricted-imports': ['error', { paths: nextPaths, patterns: nextPatterns }],
      'no-restricted-syntax': ['error', dynamicNext],
    },
  },
]

export default config
