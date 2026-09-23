'use client'

import * as React from 'react'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@fairgarden-private/design/components/ContextMenu'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from '@fairgarden-private/design/components/Menu'
import styles from './basic.module.css'

const trails = ['Ridge Loop', 'Alder Creek', 'Meadow Spur'] as const

/** One set of actions, shown in both the context menu and the visible "…" Menu. */
function RowActions({
  trail,
  onAction,
  Item,
  Separator,
}: {
  trail: string
  onAction: (message: string) => void
  Item: typeof MenuItem
  Separator: typeof MenuSeparator
}) {
  return (
    <>
      <Item icon="zoom_in" onClick={() => onAction(`Opened ${trail}.`)}>
        Open trail
      </Item>
      <Item icon="download" onClick={() => onAction(`Downloaded the ${trail} map.`)}>
        Download map
      </Item>
      <Separator />
      <Item destructive onClick={() => onAction(`Removed ${trail} from the list.`)}>
        Remove from list
      </Item>
    </>
  )
}

export function ContextMenuBasic() {
  const [last, setLast] = React.useState('Right-click a row, press Shift+F10, or use its “…” menu.')

  return (
    <div className={styles.stack}>
      <ul className={styles.list} role="list">
        {trails.map((trail) => (
          <li key={trail} className={styles.row}>
            <ContextMenu>
              <ContextMenuTrigger className={styles.area} tabIndex={0}>
                <span className={styles.name}>{trail}</span>
              </ContextMenuTrigger>
              <ContextMenuPopup>
                <RowActions
                  trail={trail}
                  onAction={setLast}
                  Item={ContextMenuItem}
                  Separator={ContextMenuSeparator}
                />
              </ContextMenuPopup>
            </ContextMenu>
            <Menu>
              <MenuTrigger iconOnly icon="more_horiz" size="sm">
                {`${trail} actions`}
              </MenuTrigger>
              <MenuPopup align="end">
                <RowActions trail={trail} onAction={setLast} Item={MenuItem} Separator={MenuSeparator} />
              </MenuPopup>
            </Menu>
          </li>
        ))}
      </ul>
      <p className={styles.status} aria-live="polite">
        {last}
      </p>
    </div>
  )
}
