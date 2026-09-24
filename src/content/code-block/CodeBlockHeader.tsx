import * as React from 'react'
import type { UseCodeResult } from '@fairgarden/docs/useCode'

import { FileTabs, FileTabsList, FileTabsPanel, type FileTab } from '../../navigation/file-tabs'
import type { PrimaryScale, RadixScale } from '../../utils/scales'

/*
 * Internal to Code Block and Demo: the 48 px header, as fg-docs'
 * CodeBlockHeader, and the panel it labels. It is File Tabs, which owns the
 * header's geometry: the folder tabs across the full width (or the one
 * file's name), the frame's side edges drawn over them, the scroll line,
 * the actions hanging outside the frame where there's room, and the status
 * laid over the tabs. This passes the actions as its `controls` and, as
 * its `status`, the "-ing…" busy label while useCode's `pendingTransform`
 * is set [D84] (no spinner). Copies confirm with a toast instead, never
 * here. The loaded and loading sections both render it, so their headers
 * match. Not exported from the index.
 */

export type CodeBlockHeaderProps = {
  /** The files as tabs (fewer than two: the one file's label). */
  tabs: readonly FileTab[]
  /** The selected file's name. */
  value: string | undefined
  /** `useCode().selectFileName`; omitted while loading. */
  onValueChange?: (id: string) => void
  /** The loading state's tabs. */
  disabled?: boolean
  /** The Demo's code section: the header joins the preview with a rule. */
  embedded: boolean
  /** The actions (`CodeActionsMenu`, or the loading state's disabled stand-ins). */
  actions: React.ReactNode
  /** `useCode().pendingTransform`: `undefined` is idle; `null` is a swap back to the original (TS). */
  pending: UseCodeResult['pendingTransform']
  primary?: PrimaryScale
  secondary?: RadixScale
  /** The panel's content: the selected file's source. */
  children: React.ReactNode
}

/** The busy label's target: TS for the original, JS for the `js` transform, else its name. */
function pendingLabel(pending: string | null) {
  if (pending === null) return 'TS'
  return pending === 'js' ? 'JS' : pending
}

export function CodeBlockHeader(props: CodeBlockHeaderProps) {
  const {
    tabs,
    value,
    onValueChange,
    disabled,
    embedded,
    actions,
    pending,
    primary,
    secondary,
    children,
  } = props
  const status = pending !== undefined ? `Switching to ${pendingLabel(pending)}…` : ''

  return (
    <FileTabs
      tabs={tabs}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      frame={embedded ? 'joined' : 'top'}
      controls={actions}
      status={status}
      primary={primary}
      secondary={secondary}
    >
      <FileTabsList />
      <FileTabsPanel>{children}</FileTabsPanel>
    </FileTabs>
  )
}
