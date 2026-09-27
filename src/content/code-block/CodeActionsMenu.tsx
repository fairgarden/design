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
import { actionLabels, openableUrl } from './CodeBlockFrame'
import styles from './code-block.module.css'

/*
 * Internal to Code Block and Demo: the header's actions, as fg-docs'
 * CodeActionsMenu lays them out, passed to File Tabs as its `controls`.
 * One named file gets the inline row of quiet icon-only Buttons (`text`:
 * no edge at rest, File Tabs draws it on hover and focus; each named by a
 * Tooltip), with the TS | JS segmented switch (lightened here only: a
 * --border-size-1 --role-rule edge, the selected half by weight, not a
 * fill; `transformGroup` / `transformToggle`) and the variant Select in
 * front, in the controls' cell beside the file's label: the row is
 * end-aligned, and the controls that join after hydration (the TS | JS
 * switch, a code controller's Reset) come first, so they take their room
 * from the label and the controls already painted stay put. Several files, and a
 * nameless file (which has no header row), get the "More actions" Menu,
 * whose trigger is a FileTabsControl holding the vertical ⋮ at the tag
 * tier: File Tabs always hangs it outside the frame's inline-end edge (an
 * ear, its --fgd-size-hit hit area in that gutter; the page leaves
 * --fgd-size-file-tabs-control free there). A nameless file whose only
 * action is copy hangs that instead: a FileTabsControl holding
 * `content_copy` at the inline tier (16 px), "Copy code", in the ⋮'s slot. Every handler is useCode's (or
 * useCopier's, for the link); a copy confirms with a toast, never in the
 * header or the menu (CodeBlockToasts).
 * Not exported from the index.
 */

export type CodeActionsMenuProps = {
  /** The inline row (one named file) instead of the menu (several files, or a nameless one). */
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

/** One icon-only action: a small quiet (`text`) Button named by its Tooltip; File Tabs draws its edge on hover and focus. */
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
      variant="text"
      iconOnly
      size="sm"
      icon={icon}
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noreferrer noopener" />}
    >
      {label}
    </Button>
  ) : (
    <Button variant="text" iconOnly size="sm" icon={icon} onClick={onClick}>
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
  const sourceUrl = openableUrl(fileUrl)
  const { copy: copyLabel, link: linkLabel, source: sourceLabel } = actionLabels(fileName)
  const markdownLabel = 'Copy all files as Markdown'
  const resetLabel = 'Reset edits'

  if (inline) {
    // End-aligned, and late controls first: Reset (a code controller's) and
    // the TS | JS switch join after hydration (the loading state can't know
    // them), so they enter at the row's start, taking room from the label,
    // and the Select and Buttons painted from the first frame keep their
    // places.
    return (
      <TooltipProvider>
        {onReset ? <IconAction icon="restart_alt" label={resetLabel} onClick={onReset} /> : null}
        {jsTransform ? (
          <span ref={switchRef} className={styles.transformSwitch}>
            <ToggleGroup
              variant="segmented"
              className={styles.transformGroup}
              aria-label={TRANSFORM_LABELS.menu}
              value={[jsTransform.enabled ? 'on' : 'off']}
              onValueChange={(value) => {
                // Pressing the pressed cell would empty a single group; keep one side on.
                if (value.length === 0) return
                const enabled = value[value.length - 1] === 'on'
                if (enabled !== jsTransform.enabled) jsTransform.onToggle(enabled, switchRef.current)
              }}
            >
              <Toggle value="off" size="sm" className={styles.transformToggle}>
                {TRANSFORM_LABELS.off}
              </Toggle>
              <Toggle value="on" size="sm" className={styles.transformToggle}>
                {TRANSFORM_LABELS.on}
              </Toggle>
            </ToggleGroup>
          </span>
        ) : null}
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
        {onCopy ? <IconAction icon="content_copy" label={copyLabel} onClick={onCopy} /> : null}
        {onCopyLink ? <IconAction icon="link" label={linkLabel} onClick={onCopyLink} /> : null}
        {sourceUrl ? <IconAction icon="open_in_new" label={sourceLabel} href={sourceUrl} /> : null}
        {onCopyMarkdown ? (
          <IconAction icon="content_copy" label={markdownLabel} onClick={onCopyMarkdown} />
        ) : null}
      </TooltipProvider>
    )
  }

  // A nameless file whose one action is copy: that action hangs by itself,
  // one click, in the ⋮'s slot and geometry (a FileTabsControl: the same
  // ear, hit area, hover outline and corner wrap). If another action joins
  // later (a TS | JS transform worked out in the browser), the ⋮ takes the
  // slot instead: the same box, only the glyph changes. (Several files
  // always offer copy Markdown too, so they never land here.)
  const copyOnly =
    onCopy !== undefined &&
    !onCopyLink &&
    !sourceUrl &&
    !onCopyMarkdown &&
    !onReset &&
    !jsTransform &&
    !variants
  if (copyOnly) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <FileTabsControl aria-label={copyLabel} onClick={onCopy}>
              <Icon name="content_copy" size="inline" weight="interactive" />
            </FileTabsControl>
          }
        />
        <TooltipPopup>{copyLabel}</TooltipPopup>
      </Tooltip>
    )
  }

  const moreLabel = 'More actions'
  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger
          render={
            <BaseMenu.Trigger ref={triggerRef} aria-label={moreLabel} render={<FileTabsControl />}>
              <Icon name="more_vert" size="tag" weight="interactive" />
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
