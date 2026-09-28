'use client'

import { Button } from '@fairgarden/design/actions/button'
import { useToastManager } from '@fairgarden/design/feedback/toast'
import type { IconName } from '@fairgarden/design/foundations/icon'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '@fairgarden/design/overlays/tooltip'
import styles from './single.module.css'

const name = 'Volunteer handbook'
const text = `Volunteer handbook

Sign in at the shed whistle board, wear closed shoes, and ask a crew lead before using the chipper. Work days run 9 to noon; water and gloves are provided.`

/** A quiet (`text`) icon-only Button named by its Tooltip; a link when it has an `href`. */
function IconAction(props: {
  icon: IconName
  label: string
  onClick?: () => void
  href?: string
  download?: string
}) {
  const { icon, label, onClick, href, download } = props
  const button = href ? (
    <Button
      variant="text"
      iconOnly
      size="sm"
      icon={icon}
      nativeButton={false}
      render={<a href={href} download={download} />}
    >
      {label}
    </Button>
  ) : (
    <Button variant="text" iconOnly size="sm" icon={icon} onClick={onClick}>
      {label}
    </Button>
  )
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipPopup>{label}</TooltipPopup>
    </Tooltip>
  )
}

/**
 * One document: its title as a label, and a row of quiet icon Buttons
 * beside it, their edge drawn only on hover and focus.
 * Copying the link confirms with a toast in the page's toast bar, not in
 * the header.
 */
export function FileTabsSingle() {
  const toasts = useToastManager()
  const copyLink = () => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#single`))
      .then(
        () => toasts.add({ status: 'success', title: 'Link copied' }),
        () =>
          toasts.add({
            status: 'danger',
            title: "Couldn't copy the link",
            description: "The browser didn't allow access to the clipboard.",
          }),
      )
  }

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={[{ id: name, name }]}
        controls={
          <TooltipProvider>
            <IconAction icon="link" label="Copy link" onClick={copyLink} />
            <IconAction
              icon="download"
              label={`Download ${name}`}
              href={`data:text/plain,${encodeURIComponent(text)}`}
              download="volunteer-handbook.txt"
            />
          </TooltipProvider>
        }
        className={styles.frame}
      >
        <FileTabsList />
        <FileTabsPanel>
          <div className={styles.doc}>
            <p>
              Sign in at the shed whistle board, wear closed shoes, and ask a crew lead before using
              the chipper. Work days run 9 to noon; water and gloves are provided.
            </p>
          </div>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
