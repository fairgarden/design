'use client'

import * as React from 'react'
import { Menubar, MenubarMenu } from '@fairgarden/design/overlays/menubar'
import {
  MenuCheckboxItem,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuPopup,
} from '@fairgarden/design/overlays/menu'
import styles from './basic.module.css'

export function MenubarBasic() {
  const [last, setLast] = React.useState('No command yet.')
  const [showGrid, setShowGrid] = React.useState(true)
  const [showContours, setShowContours] = React.useState(false)
  const run = (message: string) => () => setLast(message)

  return (
    <div className={styles.stack}>
      <Menubar>
        <MenubarMenu label="File">
          <MenuItem shortcut="⌘ N" onClick={run('New survey.')}>
            New survey
          </MenuItem>
          <MenuItem shortcut="⌘ O" onClick={run('Opened a survey.')}>
            Open survey
          </MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger icon="download">Export as</MenuSubmenuTrigger>
            <MenuPopup>
              <MenuItem onClick={run('Exported a CSV.')}>CSV table</MenuItem>
              <MenuItem onClick={run('Exported a GPX track.')}>GPX track</MenuItem>
            </MenuPopup>
          </MenuSubmenu>
        </MenubarMenu>
        <MenubarMenu label="Edit">
          <MenuItem shortcut="⌘ Z" onClick={run('Undid the last change.')}>
            Undo
          </MenuItem>
          <MenuItem disabled shortcut="⇧ ⌘ Z">
            Redo (nothing to redo)
          </MenuItem>
          <MenuSeparator />
          <MenuItem destructive onClick={run('Cleared the plot.')}>
            Clear plot
          </MenuItem>
        </MenubarMenu>
        <MenubarMenu label="View Options">
          <MenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Survey grid
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={showContours} onCheckedChange={setShowContours}>
            Contour lines
          </MenuCheckboxItem>
        </MenubarMenu>
      </Menubar>
      <p className={styles.status} aria-live="polite">
        {`${last} Grid ${showGrid ? 'on' : 'off'}, contours ${showContours ? 'on' : 'off'}.`}
      </p>
    </div>
  )
}
