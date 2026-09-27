import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import { serverSourceEnhancers } from '@fairgarden/design/utils/docs/serverSourceEnhancers'
import styles from './basic.module.css'

const sourceParser = createParseSource()

const source = `import { Button } from '@fairgarden/design/actions/button'

export function JoinCrew() {
  return <Button variant="solid">Join the Crew</Button>
}`

/** A block with one file: its name, and the actions inline. */
export function CodeBlockBasic() {
  return (
    <div className={styles.block}>
      <CodeHighlighter
        fileName="JoinCrew.tsx"
        name="Join the Crew"
        slug="join-crew"
        Content={CodeBlock}
        sourceParser={sourceParser}
        sourceEnhancers={serverSourceEnhancers}
      >
        {source}
      </CodeHighlighter>
    </div>
  )
}
