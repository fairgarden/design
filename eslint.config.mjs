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

/*
 * Inline styles write custom properties only (§1.11.1): a component sets
 * `--x` inline and its module maps it to the real property. A consumer's
 * own `style` passes through (spread), and a string key starting with `--`
 * is a custom property. These catch the package writing a real property:
 * a `style` object key, a style object typed as CSSProperties, an
 * assignment to `element.style.*`, `style.setProperty` with a literal
 * non-custom name, `Object.assign(element.style, …)` and
 * `setAttribute('style', …)`.
 */
const inlineStyle = {
  message:
    'Inline styles write custom properties only (§1.11.1): set `--x` inline and map it to the real property in the module CSS.',
}
const cssPropertiesObject =
  ':matches(TSAsExpression[typeAnnotation.typeName.right.name="CSSProperties"], VariableDeclarator[id.typeAnnotation.typeAnnotation.typeName.right.name="CSSProperties"], ArrowFunctionExpression[returnType.typeAnnotation.typeName.right.name="CSSProperties"])'
const realKey = ':matches(Property[computed=false][key.type="Identifier"], Property[key.type="Literal"][key.value!=/^--/])'
// A style value written as an object literal, directly or through a ternary or `&&`.
const styleValues = ['JSXAttribute[name.name="style"] > JSXExpressionContainer', 'Property[key.name="style"]']
const objectPaths = ['>', '> ConditionalExpression >', '> LogicalExpression >']
const inlineStyleRules = [
  ...styleValues.flatMap((value) =>
    objectPaths.map((path) => ({ selector: `${value} ${path} ObjectExpression > ${realKey}`, ...inlineStyle }))
  ),
  { selector: `${cssPropertiesObject} > ObjectExpression > ${realKey}`, ...inlineStyle },
  {
    selector: 'AssignmentExpression > MemberExpression.left[object.type="MemberExpression"][object.property.name="style"]',
    ...inlineStyle,
  },
  {
    selector:
      'CallExpression[callee.property.name="setProperty"][callee.object.property.name="style"][arguments.0.type="Literal"][arguments.0.value!=/^--/]',
    ...inlineStyle,
  },
  {
    selector: 'CallExpression[callee.object.name="Object"][callee.property.name="assign"][arguments.0.property.name="style"]',
    ...inlineStyle,
  },
  { selector: 'CallExpression[callee.property.name="setAttribute"][arguments.0.value="style"]', ...inlineStyle },
]
// The outline morph's length probe (`resolveOn`, `resolveLength`): a momentary
// `outline-offset` on its own frame where `CSS.registerProperty` is missing,
// and the trigger's style attribute restored after its custom-property probe.
const morphProbeRules = inlineStyleRules.filter(
  (rule) => !/setProperty|setAttribute/.test(rule.selector)
)

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
      'no-restricted-syntax': ['error', dynamicDocsPeer, dynamicNext, ...inlineStyleRules],
    },
  },
  // The modules built on the docs engine: the peer is allowed; Next.js still is not.
  {
    files: docsModules.flatMap((dir) => [`${dir}/*.ts`, `${dir}/*.tsx`]),
    rules: {
      'no-restricted-imports': ['error', { paths: nextPaths, patterns: nextPatterns }],
      'no-restricted-syntax': ['error', dynamicNext, ...inlineStyleRules],
    },
  },
  // The outline morph's probe is the one sanctioned real-property write (§1.11.1).
  {
    files: ['src/foundations/outline-morph/morphEngine.ts'],
    rules: {
      'no-restricted-syntax': ['error', dynamicDocsPeer, dynamicNext, ...morphProbeRules],
    },
  },
]

export default config
