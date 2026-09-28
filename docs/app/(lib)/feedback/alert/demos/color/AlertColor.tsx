import { Alert } from '@fairgarden/design/feedback/alert'
import styles from './color.module.css'

/** `status` computes the secondary; an explicit `secondary` wins. */
export function AlertColor() {
  return (
    <div className={styles.stack}>
      <Alert status="info" title="Default.">
        Info takes indigo from its status.
      </Alert>
      <Alert status="info" secondary="iris" title='secondary="iris".'>
        The bar and glyph take the override.
      </Alert>
      <Alert status="success" primary="slate" title='primary="slate".'>
        The text ink comes from slate.
      </Alert>
    </div>
  )
}
