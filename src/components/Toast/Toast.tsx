'use client'

import * as React from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { Button as BaseButton } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'

import { Button } from '../Button'
import { StatusGlyph, statusLabels, statusScales, type Status } from '../../utils/StatusGlyph'
import { cx } from '../../utils/className'
import {
  OverlayScope,
  overlayActionClassName,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import styles from './toast.module.css'

/*
 * Toast (§10.17): a brief confirmation or a non-blocking notice, docked as
 * a full-width bar, never a floating card [D25].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: toast.module.css; CVA function `toast` (one toast in the bar).
 * - Axes: `status` → info | success | warning | danger (selects the glyph
 *   and its scale; it carries no class; omitted for the neutral toast);
 *   `primary`, `secondary` → scales module classes on the bar's scope
 *   (ToastProvider).
 * - Compound variants: none. Defaults: no `status`; color axes: none.
 * - Color fallback: the glyph takes the status scale [D129]; the bar takes
 *   the `white` preset's defaults.
 * - States: Root data-starting-style / data-ending-style → the clip reveal
 *   from the bottom edge, instant under --motionNotOK [D91]; data-limited →
 *   hidden beyond the one visible toast (the queue count shows); Base UI's
 *   data-type is not styled. Action :hover → label --role-link-hover, as
 *   the §9.2 `text` Button (underlined where that is --primary12) [D181],
 *   :focus-visible → ring inside the cell, :active → the inverse pair,
 *   aria-busy → "Undoing…" at rest width; a `destructive` action's label
 *   is --role-danger-text, underlined on hover [D192]. Close is an
 *   icon-only Button.
 * - Parts: viewport (the docked bar's host), base (a toast, the bar), glyph,
 *   message, title, description, queue, actions, action, close.
 * - Scope: the viewport renders in its Base UI Portal and declares a nested
 *   `white` scope (`page` scheme, no data-theme); its rule is the
 *   --border-size-2 --primary12 overlay frame on the content side only
 *   [D23, D89, D139, D156].
 * - Container: none; the bar is page frame and uses the viewport media.
 *
 * Timing: auto-dismissing toasts stay at least --ds-duration-toast (6 s)
 * and pause on hover, on focus and while the tab is hidden; warning,
 * danger and action toasts persist until acted on or dismissed.
 */
export const toast = cva(styles.base)

export type ToastStatus = Status

/** --ds-duration-toast, restated in ms for Base UI's timers. */
const TOAST_DURATION = 6000

/** An action cell's button props: its label (`children`, title case), `onClick`, `aria-busy` … */
export type ToastAction = Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'style'> & {
  /**
   * A destructive action ("Discard Notes"): the label takes the danger ink,
   * --role-danger-text [D192]. Default `false`.
   */
  destructive?: boolean
}

/** What the system keeps on each toast's `data`. */
export interface ToastData {
  actions?: ToastAction[]
}

/** Options for a toast. */
export interface ToastOptions {
  /** Reuse an id to replace a showing toast. */
  id?: string
  /** The message's lead, in `type-body-ui` at --font-weight-6 ("3 items removed"). */
  title?: React.ReactNode
  /** The rest of the message, in `type-body-ui`; up to 3 lines at base. */
  description?: React.ReactNode
  /**
   * `info` ○, `success` ●, `warning` ▲ or `danger` ◆, each with its inner
   * mark in the status scale. Omitted: the neutral toast, no glyph.
   * Warning and danger persist; danger is announced assertively.
   */
  status?: ToastStatus
  /**
   * Action cells: full-height `type-button` text cells with title-case
   * labels ("Undo", "View Order"). A toast with actions persists. While an
   * action runs, update it with `aria-busy` and an "-ing…" label ("Undoing…").
   * A destructive action sets `destructive`, which draws its label red [D192].
   */
  actions?: ToastAction[]
  /**
   * Auto-dismiss time in ms for a neutral, info or success toast without
   * actions: at least 6000 (--ds-duration-toast); `0` persists.
   */
  timeout?: number
  /** Called when the toast starts closing. */
  onClose?: () => void
  /** Called when the toast has left the DOM. */
  onRemove?: () => void
}

type BaseToastObject = BaseToast.Root.ToastObject<ToastData>

function isStatus(type: string | undefined): type is ToastStatus {
  return type === 'info' || type === 'success' || type === 'warning' || type === 'danger'
}

/** Base UI's promise toasts report `error`; the system calls it danger. */
function toStatus(type: string | undefined): ToastStatus | undefined {
  if (type === 'error') return 'danger'
  return isStatus(type) ? type : undefined
}

/** At least --ds-duration-toast; 0 persists; undefined keeps the provider's. */
function clampTimeout(timeout: number | undefined): number | undefined {
  if (timeout === undefined) return undefined
  return timeout <= 0 ? 0 : Math.max(timeout, TOAST_DURATION)
}

/** Applies the §10.17 rules: persistence, the minimum time and assertive danger. */
function toBaseOptions(options: Omit<Partial<ToastOptions>, 'id'>, previous?: BaseToastObject) {
  const { status: statusOption, actions: actionsOption, timeout: timeoutOption, ...rest } = options
  const status = 'status' in options ? statusOption : toStatus(previous?.type)
  const actions = 'actions' in options ? actionsOption : previous?.data?.actions
  const persists = status === 'warning' || status === 'danger' || (actions?.length ?? 0) > 0
  const timeout = persists
    ? 0
    : clampTimeout('timeout' in options ? timeoutOption : previous?.timeout)

  return {
    ...rest,
    type: status,
    timeout,
    priority: status === 'danger' ? ('high' as const) : ('low' as const),
    data: { ...previous?.data, actions },
  }
}

/** The toast manager with the §10.17 rules applied. */
export interface ToastManager {
  /** The toasts, newest first. */
  toasts: BaseToastObject[]
  /** Shows a toast and returns its id. Only one shows at a time; the rest queue. */
  add: (options: ToastOptions) => string
  /** Changes a toast, such as an action's busy label; persistence is recomputed. */
  update: (id: string, options: Omit<Partial<ToastOptions>, 'id'>) => void
  /** Closes one toast, or all of them without an id. */
  close: (id?: string) => void
}

/**
 * Adds, updates and closes toasts from inside a ToastProvider, with the
 * §10.17 rules applied: warning, danger and action toasts persist, the
 * rest stay at least 6 s, and danger is announced assertively.
 */
export function useToastManager(): ToastManager {
  const manager = BaseToast.useToastManager<ToastData>()
  const { toasts, add, update, close } = manager

  return React.useMemo<ToastManager>(
    () => ({
      toasts,
      add: ({ id, ...options }) => add({ id, ...toBaseOptions(options) }),
      update: (id, options) => update(id, (previous) => toBaseOptions(options, previous)),
      close,
    }),
    [toasts, add, update, close]
  )
}

/** Props for ToastProvider. */
export interface ToastProviderProps {
  children?: React.ReactNode
  /**
   * Default auto-dismiss time in ms, at least 6000 (--ds-duration-toast).
   * Timers pause on hover, on focus and while the tab is hidden.
   */
  timeout?: number
  /** A manager from `Toast.createToastManager()` in @base-ui/react, to add toasts from outside React. */
  toastManager?: BaseToast.Provider.Props['toastManager']
  /** Primary Radix scale inside the bar's `white` scope. Omitted, the white preset's default [D133]. */
  primary?: PrimaryScale
  /** Secondary Radix scale inside the bar. Omitted, the white preset's default. */
  secondary?: RadixScale
  /** The bar region's accessible name. Default "Notifications". */
  label?: string
  /** The element the bar's portal renders into. Default: `document.body`. */
  container?: BaseToast.Portal.Props['container']
}

/**
 * Provides toasts to its children and renders the docked bar: full width
 * at the bottom viewport edge on --layer-5, a `white` scope with a
 * --border-size-2 --primary12 top rule, content aligned to
 * --ds-container-content. One toast shows at a time; a queue count
 * ("1 of 3") shows while more wait. The page reserves no space for it.
 */
export function ToastProvider(props: ToastProviderProps) {
  const { children, timeout, toastManager, primary, secondary, label, container } = props
  return (
    <BaseToast.Provider
      timeout={clampTimeout(timeout) ?? TOAST_DURATION}
      limit={1}
      toastManager={toastManager}
    >
      {children}
      <ToastViewport primary={primary} secondary={secondary} label={label} container={container} />
    </BaseToast.Provider>
  )
}

function ToastViewport(
  props: Pick<ToastProviderProps, 'primary' | 'secondary' | 'label' | 'container'>
) {
  const { primary, secondary, label, container } = props
  const { toasts } = BaseToast.useToastManager<ToastData>()
  const scales = overlayScales(primary, secondary)
  const hasToasts = toasts.length > 0

  // A hidden tab pauses the timers. Base UI pauses on window blur, which
  // switching tabs fires, but a page loaded or updated in a background tab
  // never received one; send it while hidden. This effect runs after the
  // viewport's own, which attach the listeners once a toast exists.
  React.useEffect(() => {
    if (!hasToasts) return undefined
    const pauseWhileHidden = () => {
      if (document.visibilityState === 'hidden') {
        window.dispatchEvent(new FocusEvent('blur'))
      }
    }
    pauseWhileHidden()
    document.addEventListener('visibilitychange', pauseWhileHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhileHidden)
  }, [hasToasts])

  const queued = toasts.filter((item) => item.transitionStatus !== 'ending')

  return (
    <BaseToast.Portal container={container}>
      <BaseToast.Viewport
        {...overlayAttributes}
        aria-label={label}
        className={cx(
          styles.viewport,
          primaryScaleVariants[scales.primary],
          secondaryScaleVariants[scales.secondary],
          overlayActionClassName
        )}
      >
        <OverlayScope>
          {toasts.map((item) => (
            <ToastItem
              key={item.id}
              toast={item}
              position={queued.indexOf(item) + 1}
              total={queued.length}
            />
          ))}
        </OverlayScope>
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

function ToastItem(props: { toast: BaseToastObject; position: number; total: number }) {
  const { toast: item, position, total } = props
  const status = toStatus(item.type)
  const actions = item.data?.actions ?? []

  return (
    <BaseToast.Root toast={item} className={toast()}>
      {status ? (
        <StatusGlyph
          {...overlayAttributes}
          status={status}
          label={statusLabels[status]}
          className={cx(styles.glyph, secondaryScaleVariants[statusScales[status]])}
        />
      ) : null}
      <div className={styles.message}>
        <BaseToast.Title className={styles.title} />
        <BaseToast.Description className={styles.description} />
      </div>
      {total > 1 && position > 0 ? (
        <span className={styles.queue}>
          {position} of {total}
        </span>
      ) : null}
      {actions.length > 0 ? (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <ToastActionCell key={index} {...action} />
          ))}
        </div>
      ) : null}
      <BaseToast.Close
        className={styles.close}
        render={
          <Button variant="outline" iconOnly icon="close">
            Close
          </Button>
        }
      />
    </BaseToast.Root>
  )
}

/** An action cell: holds its rest width while busy and ignores presses then [D84]. */
function ToastActionCell(props: ToastAction) {
  const { onClick, disabled, destructive, ...rest } = props
  const busy = rest['aria-busy'] === true || rest['aria-busy'] === 'true'
  const element = React.useRef<HTMLButtonElement | null>(null)
  const restWidth = React.useRef<number | null>(null)

  React.useLayoutEffect(() => {
    if (!busy && element.current) {
      restWidth.current = element.current.getBoundingClientRect().width
    }
  })

  React.useLayoutEffect(() => {
    const node = element.current
    if (!busy || !node || restWidth.current === null) return undefined
    node.style.setProperty('--toast-action-rest-width', `${restWidth.current}px`)
    return () => {
      node.style.removeProperty('--toast-action-rest-width')
    }
  }, [busy])

  return (
    <BaseButton
      {...rest}
      ref={element}
      disabled={disabled}
      className={cx(styles.action, destructive ? styles.actionDestructive : undefined)}
      onClick={busy ? undefined : onClick}
    />
  )
}
