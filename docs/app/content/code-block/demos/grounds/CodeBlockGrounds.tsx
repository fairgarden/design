import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const sourceParser = createParseSource()

const source = `// Totals for the season's work days.
const plots = ['north', 'south', 'orchard'] as const

export function seasonReport(planted: Record<string, number>) {
  let total = 0
  for (const plot of plots) total += planted[plot] ?? 0
  return { total, plots: plots.length, done: total >= 120 }
}`

/** The same block on pollen and heather: the tokens take each ground's scales. */
export function CodeBlockGrounds() {
  return (
    <div className={styles.stack}>
      {(['pollen', 'heather'] as const).map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <CodeHighlighter
            fileName="seasonReport.ts"
            name={`Season report on ${preset}`}
            slug={`season-report-${preset}`}
            Content={CodeBlock}
            sourceParser={sourceParser}
          >
            {source}
          </CodeHighlighter>
        </PresetGround>
      ))}
    </div>
  )
}
