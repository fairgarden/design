import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { Code } from '@fairgarden/docs/CodeHighlighter/types'
import { createParseSource } from '@fairgarden/docs/pipeline/parseSource'
import { CodeBlock } from '@fairgarden/design/content/code-block'
import styles from './files.module.css'

const sourceParser = createParseSource()

const component = `import styles from './volunteer-shift.module.css'

export function VolunteerShift({ day, crew }: { day: string; crew: number }) {
  return (
    <article className={styles.shift}>
      <h3 className={styles.day}>{day}</h3>
      <p>{crew} volunteers signed up</p>
    </article>
  )
}`

const cssModule = `.shift {
  display: grid;
  gap: var(--size-px-2);
  padding: var(--size-px-3);
  border: var(--border-size-1) solid var(--role-rule);
}

.day {
  font-weight: var(--font-weight-7);
}`

const shiftList = `import { VolunteerShift } from './VolunteerShift'
import { useShifts } from './useShifts'

export function ShiftList() {
  const shifts = useShifts()
  return shifts.map((shift) => <VolunteerShift key={shift.day} {...shift} />)
}`

const useShifts = `const shifts = [
  { day: 'Saturday', crew: 12 },
  { day: 'Sunday', crew: 8 },
]

export function useShifts() {
  return shifts
}`

const test = `import { render, screen } from '@testing-library/react'
import { VolunteerShift } from './VolunteerShift'

test('names the day', () => {
  render(<VolunteerShift day="Saturday" crew={12} />)
  expect(screen.getByRole('heading')).toHaveTextContent('Saturday')
})`

const index = `export * from './VolunteerShift'
export * from './ShiftList'`

/** One variant with six files: the main file, then its extra files, in order. */
const code: Code = {
  Default: {
    fileName: 'VolunteerShift.tsx',
    source: component,
    extraFiles: {
      'volunteer-shift.module.css': { source: cssModule },
      'ShiftList.tsx': { source: shiftList },
      'useShifts.ts': { source: useShifts },
      'VolunteerShift.test.tsx': { source: test },
      'index.ts': { source: index },
    },
  },
}

/** Several files: folder tabs, and the actions in the "More actions" menu. */
export function CodeBlockFiles({ slug = 'volunteer-shift' }: { slug?: string }) {
  return (
    <div className={styles.block}>
      <CodeHighlighter
        code={code}
        name="Volunteer shift"
        slug={slug}
        Content={CodeBlock}
        sourceParser={sourceParser}
      />
    </div>
  )
}
