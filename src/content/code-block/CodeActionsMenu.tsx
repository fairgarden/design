'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import type { UseCodeResult } from '@fairgarden/docs/useCode'

import { Button } from '../../actions/button'
import { Toggle } from '../../actions/toggle'
import { ToggleGroup } from '../../actions/toggle-group'
import { Select } from '../../forms/select'
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from '../../overlays/menu'
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from '../../overlays/tooltip'
import { Icon, type IconName } from '../../foundations/icon'
import { FileTabsControl } from '../../navigation/file-tabs'
import styles from './code-block.module.css'

/*
 * Internal to Code Block and Demo: the header's actions, as fg-docs'
 * CodeActionsMenu lays them out, passed to File Tabs as its `controls`.
 * One file gets the inline row of icon-only Buttons (each named by a
 * Tooltip), with the variant Select and the TS | JS segmented switch in
 * front, in the controls' cell beside the file's label. Several files get
 * the "More actions" Menu, whose trigger is a FileTabsControl: File Tabs
 * hangs it outside the frame's inline-end edge where there's room (an
 * ear, its --fgd-size-hit hit area all in that gutter), and elsewhere sets
 * it in a --fgd-size-hit cell at the header's end. Every handler is
 * useCode's (or useCopier's, for the link); a copy confirms with a toast,
 * never in the header or the menu (CodeBlockToasts).
 * Not exported from the index.
 */

export type CodeActionsMenuProps = {
  /** The inline row (one file) instead of the menu (several). */
  inline: boolean
  /** `useCode().selectedFileName`, for the action labels. */
  fileName: string | undefined
  /** `useCode().copy`. */
  onCopy?: UseCodeResult['copy']
  /** Copies the selected file's deep link (`useCopier`); omitted without a slug. */
  onCopyLink?: (event: React.MouseEvent<Element>) => void
  /** `useCode().selectedFileUrl`. Hidden for `file://` URLs, as in the source. */
  fileUrl?: string
  /** `useCode().copyMarkdown`, offered with several files only. */
  onCopyMarkdown?: UseCodeResult['copyMarkdown']
  /** `useCode().reset`: defined only with a `CodeControllerContext`. */
  onReset?: UseCodeResult['reset']
  /** The TS | JS switch; `anchor` is the inline switch or the ⋮ trigger, for scroll anchoring. */
  jsTransform?: { enabled: boolean; onToggle: (enabled: boolean, anchor: HTMLElement | null) => void }
  /** Two or more variants; `anchor` is the Select or the ⋮ trigger. */
  variants?: {
    items: readonly { value: string; label: string }[]
    selected: string | undefined
    onChange: (value: string, anchor: HTMLElement | null) => void
  }
}

const TRANSFORM_LABELS = { off: 'TS', on: 'JS', menu: 'Transpile to JavaScript' } as const

/** One icon-only action: a small outline Button named by its Tooltip. */
function IconAction({
  icon,
  label,
  onClick,
  href,
}: {
  icon: IconName
  label: string
  onClick?: (event: React.MouseEvent<Element>) => void
  href?: string
}) {
  const button = href ? (
    <Button
      iconOnly
      size="sm"
      icon={icon}
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noreferrer noopener" />}
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

export function CodeActionsMenu(props: CodeActionsMenuProps) {
  const {
    inline,
    fileName,
    onCopy,
    onCopyLink,
    fileUrl,
    onCopyMarkdown,
    onReset,
    jsTransform,
    variants,
  } = props

  // Scroll anchors: the inline switch's and Select's wrappers stay mounted
  // across a swap; in the menu, the items unmount on close, so the trigger
  // anchors instead.
  const switchRef = React.useRef<HTMLSpanElement | null>(null)
  const selectRef = React.useRef<HTMLSpanElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  // A `file://` URL means the build-time rewrite was skipped; it wouldn't open from the browser.
  const sourceUrl = fileUrl && !fileUrl.startsWith('file://') ? fileUrl : undefined
  const copyLabel = fileName ? `Copy ${fileName} source` : 'Copy source'
  const linkLabel = fileName ? `Copy ${fileName} link` : 'Copy link'
  const sourceLabel = fileName ? `View ${fileName} source` : 'View source'
  const markdownLabel = 'Copy all files as Markdown'
  const resetLabel = 'Reset edits'

  if (inline) {
    return (
      <>
        {variants ? (
          <span ref={selectRef} className={styles.variantSelect}>
            <Select
              aria-label="Variant"
              items={variants.items}
              value={variants.selected ?? null}
              onValueChange={(value) => {
                if (value != null) variants.onChange(value, selectRef.current)
              }}
            />
          </span>
        ) : null}
        {jsTransform ? (
          <span ref={switchRef} className={styles.transformSwitch}>
            <ToggleGroup
              variant="segmented"
              aria-label={TRANSFORM_LABELS.menu}
              value={[jsTransform.enabled ? 'on' : 'off']}
              onValueChange={(value) => {
                // Pressing the pressed cell would empty a single group; keep one side on.
                if (value.length === 0) return
                const enabled = value[value.length - 1] === 'on'
                if (enabled !== jsTransform.enabled) jsTransform.onToggle(enabled, switchRef.current)
              }}
            >
              <Toggle value="off" size="sm">
                {TRANSFORM_LABELS.off}
              </Toggle>
              <Toggle value="on" size="sm">
                {TRANSFORM_LABELS.on}
              </Toggle>
            </ToggleGroup>
          </span>
        ) : null}
        <TooltipProvider>
          {onCopy ? <IconAction icon="content_copy" label={copyLabel} onClick={onCopy} /> : null}
          {onCopyLink ? (
            <IconAction icon="link" label={linkLabel} onClick={onCopyLink} />
          ) : null}
          {onReset ? <IconAction icon="restart_alt" label={resetLabel} onClick={onReset} /> : null}
          {sourceUrl ? <IconAction icon="open_in_new" label={sourceLabel} href={sourceUrl} /> : null}
          {onCopyMarkdown ? (
            <IconAction icon="content_copy" label={markdownLabel} onClick={onCopyMarkdown} />
          ) : null}
        </TooltipProvider>
      </>
    )
  }

  const moreLabel = 'More actions'
  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger
          render={
            <BaseMenu.Trigger ref={triggerRef} aria-label={moreLabel} render={<FileTabsControl />}>
              <Icon name="more_horiz" weight="interactive" />
            </BaseMenu.Trigger>
          }
        />
        <TooltipPopup>{moreLabel}</TooltipPopup>
      </Tooltip>
      <MenuPopup align="end">
        {onCopy ? (
          <MenuItem icon="content_copy" onClick={onCopy}>
            {copyLabel}
          </MenuItem>
        ) : null}
        {onCopyLink ? (
          <MenuItem icon="link" onClick={onCopyLink}>
            {linkLabel}
          </MenuItem>
        ) : null}
        {sourceUrl ? (
          <MenuItem
            icon="open_in_new"
            closeOnClick
            render={<a href={sourceUrl} target="_blank" rel="noreferrer noopener" />}
          >
            {sourceLabel}
          </MenuItem>
        ) : null}
        {onCopyMarkdown ? (
          <MenuItem icon="content_copy" onClick={onCopyMarkdown}>
            {markdownLabel}
          </MenuItem>
        ) : null}
        {jsTransform ? (
          <>
            <MenuSeparator />
            <MenuCheckboxItem
              checked={jsTransform.enabled}
              closeOnClick={false}
              onCheckedChange={(enabled) => jsTransform.onToggle(enabled, triggerRef.current)}
            >
              {TRANSFORM_LABELS.menu}
            </MenuCheckboxItem>
          </>
        ) : null}
        {variants ? (
          <>
            <MenuSeparator />
            <MenuRadioGroup
              value={variants.selected}
              onValueChange={(value) => variants.onChange(String(value), triggerRef.current)}
            >
              {variants.items.map((item) => (
                <MenuRadioItem key={item.value} value={item.value} closeOnClick>
                  {item.label}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </>
        ) : null}
        {onReset ? (
          <MenuItem icon="restart_alt" onClick={onReset}>
            {resetLabel}
          </MenuItem>
        ) : null}
      </MenuPopup>
    </Menu>
  )
}
