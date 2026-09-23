import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '@fairgarden/design/overlays/tooltip'
import { Button } from '@fairgarden/design/actions/button'
import styles from './variants.module.css'

/**
 * The three trigger forms: a label on icon-only buttons (sharing one
 * Provider, so neighbors open at once), a `help` hint beside a label, and a
 * dotted-underline term in running text.
 */
export function TooltipVariants() {
  return (
    <div className={styles.stack}>
      <TooltipProvider>
        <div className={styles.row}>
          <Tooltip>
            <TooltipTrigger render={<Button iconOnly icon="zoom_in">Zoom In</Button>} />
            <TooltipPopup>Zoom In</TooltipPopup>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button iconOnly icon="zoom_out">Zoom Out</Button>} />
            <TooltipPopup>Zoom Out</TooltipPopup>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button iconOnly icon="recenter">Reset View</Button>} />
            <TooltipPopup>Reset View</TooltipPopup>
          </Tooltip>
        </div>
      </TooltipProvider>

      <p className={styles.copy}>
        Membership tier{' '}
        <Tooltip>
          <TooltipTrigger kind="hint">About membership tiers</TooltipTrigger>
          <TooltipPopup>Tiers renew each spring.</TooltipPopup>
        </Tooltip>
      </p>

      <p className={styles.copy}>
        The parcel is protected by a{' '}
        <Tooltip>
          <TooltipTrigger kind="term">conservation easement</TooltipTrigger>
          <TooltipPopup side="bottom">A legal limit on development that stays with the deed.</TooltipPopup>
        </Tooltip>{' '}
        held by the trust.
      </p>
    </div>
  )
}
