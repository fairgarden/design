'use client'

import * as React from 'react'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '@fairgarden-private/design/components/Menu'
import {
  Toolbar,
  ToolbarBottomRule,
  ToolbarButton,
  ToolbarCount,
  ToolbarGroup,
  ToolbarItem,
  ToolbarMore,
  ToolbarSeparator,
} from '@fairgarden-private/design/components/Toolbar'
import styles from './kinds.module.css'

const sorts = {
  recent: 'Recently Accessed',
  name: 'Name',
  size: 'Size',
} as const

type Sort = keyof typeof sorts

export function ToolbarKinds() {
  const [sort, setSort] = React.useState<Sort>('recent')
  const [zoom, setZoom] = React.useState(100)
  const [figure, setFigure] = React.useState(3)
  const [last, setLast] = React.useState('No action yet.')
  const step = (by: number) => () => setFigure((value) => ((value - 1 + by + 12) % 12) + 1)

  return (
    <div className={styles.stack}>
      <p className={styles.name}>list</p>
      <div className={styles.frame}>
        <Toolbar
          aria-label="Survey plots"
          caption={`54 items · Sorted by ${sorts[sort].toLowerCase()}`}
        >
          <ToolbarCount>Items (54)</ToolbarCount>
          <ToolbarButton icon="add" onClick={() => setLast('Added a plot.')}>
            Add Plot
          </ToolbarButton>
          <ToolbarButton icon="download" lowPriority onClick={() => setLast('Exported the list.')}>
            Export List
          </ToolbarButton>
          <Menu>
            <ToolbarItem
              render={
                <MenuTrigger variant="text" size="sm" icon="expand_more" iconPosition="end">
                  {sorts[sort]}
                </MenuTrigger>
              }
            />
            <MenuPopup align="end">
              <MenuRadioGroup value={sort} onValueChange={(value: Sort) => setSort(value)}>
                {(Object.keys(sorts) as Sort[]).map((value) => (
                  <MenuRadioItem key={value} value={value}>
                    {sorts[value]}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>
          <ToolbarMore>
            <MenuItem icon="download" onClick={() => setLast('Exported the list.')}>
              Export list
            </MenuItem>
          </ToolbarMore>
          <ToolbarBottomRule variant="hairline" />
        </Toolbar>
      </div>

      <p className={styles.name}>figure</p>
      <div className={styles.frame}>
        <Toolbar kind="figure" aria-label="Figure controls">
          <ToolbarGroup>
            <ToolbarButton
              iconOnly
              icon="zoom_out"
              onClick={() => setZoom((value) => Math.max(50, value - 25))}
            >
              Zoom Out
            </ToolbarButton>
            <ToolbarButton
              iconOnly
              icon="zoom_in"
              onClick={() => setZoom((value) => Math.min(200, value + 25))}
            >
              Zoom In
            </ToolbarButton>
            <ToolbarButton iconOnly icon="recenter" onClick={() => setZoom(100)}>
              Recenter
            </ToolbarButton>
            <ToolbarSeparator />
            <ToolbarButton icon="download" onClick={() => setLast('Downloaded the figure.')}>
              Download Figure
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton iconOnly icon="chevron_left" onClick={step(-1)}>
              Previous Figure
            </ToolbarButton>
            <ToolbarCount>{figure} of 12</ToolbarCount>
            <ToolbarButton iconOnly icon="chevron_right" onClick={step(1)}>
              Next Figure
            </ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </div>

      <p className={styles.status} aria-live="polite">
        Zoom {zoom}% · {last}
      </p>
    </div>
  )
}
