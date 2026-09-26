'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { useToastManager } from '@fairgarden/design/feedback/toast'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
} from '@fairgarden/design/navigation/file-tabs'
import { Menu, MenuItem, MenuPopup } from '@fairgarden/design/overlays/menu'
import styles from './controls.module.css'

const documents = [
  { id: 'Borrowing rules', text: 'Take up to five seed packets a season; return a packet of saved seed if you can.' },
  { id: 'Catalogue', text: 'Beans, squash, calendula and six heirloom tomatoes, sorted by sowing month.' },
  { id: 'Returns', text: 'Dry saved seed for two weeks, then label it with the plant and the year.' },
]

/** The ⋮ Menu: document actions; copying the link confirms with a toast. */
function MoreActions({ document }: { document: string }) {
  const toasts = useToastManager()
  const copyLink = () => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#controls`))
      .then(
        () => toasts.add({ status: 'success', title: 'Link copied' }),
        () => toasts.add({ status: 'danger', title: "Couldn't copy the link" }),
      )
  }
  return (
    <Menu>
      <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
        <Icon name="more_vert" size="tag" weight="interactive" />
      </BaseMenu.Trigger>
      <MenuPopup align="end">
        <MenuItem onClick={() => window.print()}>Print {document}</MenuItem>
        <MenuItem icon="download">Download {document} (PDF)</MenuItem>
        <MenuItem icon="link" onClick={copyLink}>
          Copy link
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

function SeedLibrary() {
  const [selected, setSelected] = React.useState(documents[0].id)
  const current = documents.find((document) => document.id === selected) ?? documents[0]

  return (
    <FileTabs
      tabs={documents.map((document) => ({ id: document.id, name: document.id }))}
      value={selected}
      onValueChange={setSelected}
      controls={<MoreActions document={selected} />}
      className={styles.frame}
    >
      <FileTabsList aria-label="Seed library" />
      <FileTabsPanel>
        <div className={styles.doc}>
          <p>{current.text}</p>
        </div>
      </FileTabsPanel>
    </FileTabs>
  )
}

/**
 * The same documents and ⋮ Menu in two columns; the trigger always hangs
 * just outside the frame, and the tabs keep the whole header. Each column
 * leaves --fgd-size-file-tabs-control free past the frame: the first on
 * the page, the second, narrow, inside its own sideways clip.
 */
export function FileTabsControls() {
  return (
    <div className={styles.stack}>
      <div className={styles.gutter}>
        <SeedLibrary />
      </div>
      <div className={styles.narrow}>
        <SeedLibrary />
      </div>
    </div>
  )
}
