import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '@fairgarden-private/design/components/Tooltip'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The hint glyph and term underline follow the trigger's ground; the popup face is always the overlay scope. */
export function TooltipGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <p className={styles.copy}>
            Trail grade{' '}
            <Tooltip>
              <TooltipTrigger kind="hint">About trail grades</TooltipTrigger>
              <TooltipPopup>Grades run from easy to strenuous.</TooltipPopup>
            </Tooltip>
          </p>
          <p className={styles.copy}>
            A{' '}
            <Tooltip>
              <TooltipTrigger kind="term">kettle pond</TooltipTrigger>
              <TooltipPopup>A pond left by a melting glacier.</TooltipPopup>
            </Tooltip>{' '}
            sits at the center.
          </p>
        </PresetGround>
      ))}
    </div>
  )
}
