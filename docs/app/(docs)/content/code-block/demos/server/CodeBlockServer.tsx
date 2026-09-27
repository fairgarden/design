import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { Code } from '@fairgarden/docs/CodeHighlighter/types'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import { serverSourceEnhancers } from '@fairgarden/design/utils/docs/serverSourceEnhancers'
import styles from './server.module.css'

const sourceParser = createParseSource()

const component = `import styles from './seed-packet.module.css'

export function SeedPacket({ name, sown }: { name: string; sown: string }) {
  return (
    <p className={styles.packet}>
      {name}, sown {sown}
    </p>
  )
}`

const cssModule = `.packet {
  padding: var(--size-px-2);
  border: var(--border-size-1) solid var(--role-rule);
}`

/** Two inline files: the main file and a CSS module, both highlighted on the server. */
const code: Code = {
  Default: {
    fileName: 'SeedPacket.tsx',
    source: component,
    extraFiles: {
      'seed-packet.module.css': { source: cssModule },
    },
  },
}

/**
 * `highlightAfter="init"`, the opt-in: the server parses every file, so the
 * HTML arrives highlighted, every tab included, at the cost of server work
 * and page weight. Every other example keeps the engine's default.
 */
export function CodeBlockServer() {
  return (
    <div className={styles.block}>
      <CodeHighlighter
        code={code}
        name="Seed packet"
        slug="seed-packet"
        Content={CodeBlock}
        highlightAfter="init"
        sourceParser={sourceParser}
        sourceEnhancers={serverSourceEnhancers}
      />
    </div>
  )
}
