'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
  type FileTabsFrame,
} from '@fairgarden/design/navigation/file-tabs'
import { Menu, MenuItem, MenuPopup } from '@fairgarden/design/overlays/menu'
import styles from './frames.module.css'

const sheets = [
  { id: 'Tally sheet', text: 'Tomatoes 38 kg, squash 21 kg, beans 9 kg, from fourteen plots.' },
  { id: 'Food bank receipt', text: 'Received 52 kg of fresh produce for the Thursday pantry.' },
  { id: 'Notes', text: 'Next year, weigh the herbs too, and start the tally a week earlier.' },
]

function HarvestSheets({ frame }: { frame: FileTabsFrame }) {
  const [selected, setSelected] = React.useState(sheets[0].id)
  const current = sheets.find((sheet) => sheet.id === selected) ?? sheets[0]

  return (
    <FileTabs
      tabs={sheets.map((sheet) => ({ id: sheet.id, name: sheet.id }))}
      value={selected}
      onValueChange={setSelected}
      frame={frame}
      controls={
        <Menu>
          <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
            <Icon name="more_vert" size="tag" weight="interactive" />
          </BaseMenu.Trigger>
          <MenuPopup align="end">
            <MenuItem icon="download">Download {selected} (PDF)</MenuItem>
          </MenuPopup>
        </Menu>
      }
    >
      <FileTabsList aria-label="Harvest records" />
      <FileTabsPanel>
        <div className={styles.doc}>
          <p>{current.text}</p>
        </div>
      </FileTabsPanel>
    </FileTabs>
  )
}

/**
 * The header on its other hosts. `frame="joined"`: in a box below another
 * part (here, the season's summary), joined to it by the header's rule;
 * the Agenda demo below builds on it. `frame="none"`: no box, the tabs over
 * their panel on the page; the ⋮ trigger hangs past the header's own end.
 */
export function FileTabsFrames() {
  return (
    <div className={styles.stack}>
      <div className={styles.frame}>
        <p className={styles.output}>2026 harvest: 68 kg from fourteen plots, 52 kg to the food bank.</p>
        <HarvestSheets frame="joined" />
      </div>
      <HarvestSheets frame="none" />
    </div>
  )
}
