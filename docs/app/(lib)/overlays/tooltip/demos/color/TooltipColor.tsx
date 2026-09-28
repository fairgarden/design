import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '@fairgarden/design/overlays/tooltip'
import { Button } from '@fairgarden/design/actions/button'
import styles from './color.module.css'

/**
 * The popup takes only the props passed to it: `primary` recolors its frame
 * and text, never the trigger's scales.
 */
export function TooltipColor() {
  return (
    <TooltipProvider>
      <div className={styles.row}>
        <Tooltip>
          <TooltipTrigger render={<Button iconOnly icon="download">Download Map</Button>} />
          <TooltipPopup>Overlay default</TooltipPopup>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button iconOnly icon="download">Download Map</Button>} />
          <TooltipPopup primary="plum">Primary plum</TooltipPopup>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
