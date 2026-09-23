'use client'

import * as React from 'react'
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@fairgarden/design/overlays/menu'
import styles from './actions.module.css'

export function MenuActions() {
  const [last, setLast] = React.useState('No action yet.')
  const run = (label: string) => () => setLast(`${label}.`)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <span className={styles.object}>Field note, 12 May</span>
        <Menu>
          <MenuTrigger iconOnly icon="more_horiz">
            Note Actions
          </MenuTrigger>
          <MenuPopup>
            <MenuItem icon="download" shortcut="⌘ D" onClick={run('Downloaded the note')}>
              Download note
            </MenuItem>
            <MenuItem icon="search" shortcut="⌘ F" onClick={run('Searched similar notes')}>
              Find similar notes
            </MenuItem>
            <MenuSubmenu>
              <MenuSubmenuTrigger icon="arrow_forward">Move to</MenuSubmenuTrigger>
              <MenuPopup>
                <MenuItem onClick={run('Moved to Spring count')}>Spring count</MenuItem>
                <MenuItem onClick={run('Moved to Meadow survey')}>Meadow survey</MenuItem>
                <MenuItem disabled>Archive (needs 1 photo)</MenuItem>
              </MenuPopup>
            </MenuSubmenu>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>Danger zone</MenuGroupLabel>
              <MenuItem destructive onClick={run('Deleted the note')}>
                Delete note
              </MenuItem>
            </MenuGroup>
          </MenuPopup>
        </Menu>
      </div>
      <p className={styles.status} aria-live="polite">
        {last}
      </p>
    </div>
  )
}
