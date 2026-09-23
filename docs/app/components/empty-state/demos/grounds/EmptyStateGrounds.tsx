import { Button } from '@fairgarden-private/design/components/Button'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateHeading,
  EmptyStateText,
} from '@fairgarden-private/design/components/EmptyState'
import { Ground } from '@fairgarden-private/design/components/Ground'
import styles from './grounds.module.css'

/** The dashed frame and text re-resolve on a page ground and inside a deep field. */
export function EmptyStateGrounds() {
  return (
    <div className={styles.row}>
      <Ground kind="face" preset="paper" className={styles.face}>
        <p className={styles.name}>paper</p>
        <Empty />
      </Ground>
      <Ground kind="field" preset="forest" className={styles.face}>
        <p className={styles.name}>forest field</p>
        <Empty />
      </Ground>
    </div>
  )
}

function Empty() {
  return (
    <EmptyState>
      <EmptyStateHeading>Nothing here yet</EmptyStateHeading>
      <EmptyStateText>New events appear every Monday.</EmptyStateText>
      <EmptyStateAction>
        <Button>See Past Events</Button>
      </EmptyStateAction>
    </EmptyState>
  )
}
