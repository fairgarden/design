import { Button } from '@fairgarden/design/actions/button'
import styles from './color.module.css'

/**
 * A solid Button fills with the scope's action scale unless `secondary` is
 * passed; outline edges and labels are primary roles.
 */
export function ButtonColor() {
  return (
    <div className={styles.row}>
      <Button variant="solid">Scope Action</Button>
      <Button variant="solid" secondary="indigo">
        Secondary Indigo
      </Button>
      <Button variant="outline" primary="plum">
        Primary Plum
      </Button>
      <Button variant="text" secondary="orange" icon="arrow_forward" iconPosition="end">
        Secondary Orange
      </Button>
    </div>
  )
}
