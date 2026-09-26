import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { Code } from '@fairgarden/docs/CodeHighlighter/types'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { TypescriptToJavascriptTransformer } from '@fairgarden/docs/pipeline/transformTypescriptToJavascript'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import styles from './variants.module.css'

const sourceParser = createParseSource()
const sourceTransformers = [TypescriptToJavascriptTransformer]

const fn = `type Shift = { day: string; crew: number }

export function crewLabel({ day, crew }: Shift): string {
  return \`\${day}: \${crew} volunteers\`
}`

const arrow = `type Shift = { day: string; crew: number }

export const crewLabel = ({ day, crew }: Shift): string =>
  \`\${day}: \${crew} volunteers\``

/** Two variants of one file; the engine's JavaScript transform adds the TS | JS switch. */
const code: Code = {
  Function: { fileName: 'crewLabel.ts', source: fn },
  Arrow: { fileName: 'crewLabel.ts', source: arrow },
}

/** One file with variants: the variant Select and the TS | JS switch in the header. */
export function CodeBlockVariants() {
  return (
    <div className={styles.block}>
      <CodeHighlighter
        code={code}
        name="Crew label"
        slug="crew-label"
        Content={CodeBlock}
        sourceParser={sourceParser}
        sourceTransformers={sourceTransformers}
      />
    </div>
  )
}
