'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  ExpandingBox,
  ExpandingBoxExtra,
  ExpandingBoxMain,
  expandingBoxParts,
  startExpandingTransition,
  useExpandingBoxName,
} from '@fairgarden/design/foundations/expanding-box'
import type { PrimaryScale } from '@fairgarden/design/utils/scales'
import styles from './morph.module.css'

type MorphPanelProps = {
  /** The trigger's label and the panel's title. */
  label: string
  /** The panel's body. */
  children: React.ReactNode
  primary?: PrimaryScale
}

/**
 * A minimal owner: a button-shaped box that morphs into a panel on click
 * and back on Escape or Close. Both boxes share one name; exactly one is
 * active at a time, and the state change that swaps them runs inside
 * `startExpandingTransition`.
 */
export function MorphPanel({ label, children, primary }: MorphPanelProps) {
  const name = useExpandingBoxName()
  const panelId = React.useId()
  const titleId = React.useId()
  const [open, setOpen] = React.useState(false)
  const busy = React.useRef(false)
  const wasOpen = React.useRef(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const change = (next: boolean) => {
    if (busy.current) return
    busy.current = true
    void startExpandingTransition(() => setOpen(next), {
      direction: next ? 'open' : 'close',
    }).then(() => {
      busy.current = false
    })
  }

  // Focus moves inside the morph's flushSync, so the new snapshot already has it.
  React.useLayoutEffect(() => {
    if (open) closeRef.current?.focus()
    else if (wasOpen.current) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open])

  return (
    <div className={styles.stage}>
      <button
        ref={triggerRef}
        type="button"
        className={`${expandingBoxParts.host} ${styles.trigger}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => change(true)}
      >
        <ExpandingBox
          as="span"
          name={name}
          active={!open}
          collapsed
          primary={primary}
          className={styles.triggerInner}
        >
          <ExpandingBoxMain className={styles.triggerMain}>
            <span className={styles.triggerLabel}>{label}</span>
            <Icon name="expand_more" className={expandingBoxParts.end} />
          </ExpandingBoxMain>
        </ExpandingBox>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={titleId}
        hidden={!open}
        className={`${expandingBoxParts.host} ${styles.panel}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') change(false)
        }}
      >
        <ExpandingBox name={name} active={open} primary={primary} className={styles.panelInner}>
          <ExpandingBoxMain className={styles.panelMain}>
            <h4 id={titleId} className={styles.panelTitle}>
              {label}
            </h4>
            <Button
              ref={closeRef}
              iconOnly
              icon="close"
              size="sm"
              variant="text"
              primary={primary}
              className={expandingBoxParts.end}
              onClick={() => change(false)}
            >
              Close {label}
            </Button>
          </ExpandingBoxMain>
          <ExpandingBoxExtra className={styles.panelBody}>{children}</ExpandingBoxExtra>
        </ExpandingBox>
      </div>
    </div>
  )
}

export function ExpandingBoxMorph() {
  return (
    <MorphPanel label="Trail notes">
      <p>The ridge loop is 6.4 km with 212 m of climb. Allow three hours.</p>
      <p>The creek crossing floods after heavy rain; take the upper bridge.</p>
    </MorphPanel>
  )
}
