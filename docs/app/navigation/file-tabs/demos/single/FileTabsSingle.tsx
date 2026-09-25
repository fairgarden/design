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

const name = 'hours.ts'
const code = `export const hours = {
  open: 'dawn',
  close: 'dusk',
  dogs: 'on leash',
}`

/** An icon-only Button named by its Tooltip; a link when it has an `href`. */
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
      iconOnly
      size="sm"
      icon={icon}
      nativeButton={false}
      render={<a href={href} download={download} />}
    >
      {label}
    </Button>
  ) : (
    <Button iconOnly size="sm" icon={icon} onClick={onClick}>
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
 * One file: its name as a label, and a row of icon Buttons beside it. Copy
 * confirms with a toast in the page's toast bar, not in the header.
 */
export function FileTabsSingle() {
  const toasts = useToastManager()

  const copy = () => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(code))
      .then(
        () => toasts.add({ status: 'success', title: `${name} copied` }),
        () =>
          toasts.add({
            status: 'danger',
            title: `Couldn't copy ${name}`,
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
            <IconAction icon="content_copy" label={`Copy ${name}`} onClick={copy} />
            <IconAction
              icon="download"
              label={`Download ${name}`}
              href={`data:text/plain,${encodeURIComponent(code)}`}
              download={name}
            />
          </TooltipProvider>
        }
        className={styles.frame}
      >
        <FileTabsList />
        <FileTabsPanel>
          <pre className={styles.code}>
            <code>{code}</code>
          </pre>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
