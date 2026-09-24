import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import styles from './basic.module.css'

const sourceParser = createParseSource()

const source = `import { Button } from '@fairgarden/design/actions/button'

export function JoinCrew() {
  return <Button variant="solid">Join the Crew</Button>
}`

/** A server-highlighted block with one file: its name, and the actions inline. */
export function CodeBlockBasic() {
  return (
    <div className={styles.block}>
      <CodeHighlighter
        fileName="JoinCrew.tsx"
        name="Join the Crew"
        slug="join-crew"
        Content={CodeBlock}
        sourceParser={sourceParser}
      >
        {source}
      </CodeHighlighter>
    </div>
  )
}
