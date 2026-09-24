import { Button } from '@fairgarden/design/actions/button'
import { Tag } from '@fairgarden/design/feedback/tag'
import styles from './crew-banner.module.css'

/** A banner for the next work day, laid out by the viewport it runs in. */
export function CrewBanner() {
  return (
    <div className={styles.banner}>
      <Tag>Saturday</Tag>
      <span>Twelve volunteers are planting the orchard.</span>
      <Button variant="solid">Join the Crew</Button>
    </div>
  )
}
