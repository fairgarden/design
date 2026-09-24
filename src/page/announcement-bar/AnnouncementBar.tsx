'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground, type PageGroundPreset } from '../../foundations/ground'
import { Icon, iconHost } from '../../foundations/icon'
import { Link } from '../../actions/link'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './announcement-bar.module.css'

/*
 * Announcement Bar (§11.4): one short, authored site notice per page (a
 * closure, a deadline, shipping terms, a policy change). An `aside`
 * labelled "Announcement" holding a `p` with at most one link, an optional
 * countdown in `time` and an optional dismiss Button. It is not a Toast.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: announcement-bar.module.css; CVA function `announcementBar`.
 * - Axes: `kind` → bar | field → `bar`, `field` [D180]: a full-bleed
 *   page-ground bar, or a full-container field; `voice` → standard | mono |
 *   dual → `standard`, `mono`, `dual`; `record` → `record` (a notice of
 *   record: prints); `ruled` → `ruled` (the required bottom rule: always
 *   on with `kind: bar`, excluded with `kind: field`, whose --primary12
 *   edge does that job); `primary`, `secondary` → scales module classes.
 *   `interactive` is computed, never a prop: a bar holding a link or the
 *   dismiss grows to the --fgd-size-hit minimum.
 * - Compound variants: none.
 * - Defaults: kind bar, voice standard, record false, ruled true; color
 *   axes: none [D133].
 * - Color fallback: inherits the bar's own preset (or the page ground when
 *   the bar names none); on a preset bar `primary` and `secondary` override
 *   its Ground's scales. Secondary drives only the link underline
 *   (--role-accent) and its hover ink (--role-link-hover).
 * - States: on the dismiss (a Base UI Button) `:hover` per §9.2 icon-only
 *   (the glyph at the next tier's weight, never an added circle) [D181],
 *   `:active` → the inverse pair, `:focus-visible` → the ring.
 *   `data-disabled` is never set. Dismissal removes the element and is
 *   remembered per viewer. The link is a §9.3 Link with its own states.
 * - Parts: base, container, message, accent (the dual voice's serif
 *   phrase), link, countdown, cell, unit, dismiss, fieldBar (the field
 *   kind's Ground); the bottom `rule` is the ruled bar's own border.
 * - Scope: with `kind: bar`, the root is a `kind="band"` Ground of a page
 *   ground when `preset` is given (otherwise it inherits the page ground);
 *   with `kind: field`, a `kind="field"` Ground of a field preset, inset to
 *   the full width of --fgd-container-content, with its radius and its
 *   --primary12 edge [D178, D180].
 * - Container: none: it inherits its context and never reflows as a
 *   module; the responsive rules are viewport rules [D163].
 */
export const announcementBar = cva(styles.base, {
  variants: {
    kind: {
      bar: styles.bar,
      field: styles.field,
    },
    voice: {
      standard: styles.standard,
      mono: styles.mono,
      dual: styles.dual,
    },
    record: {
      true: styles.record,
    },
    ruled: {
      true: styles.ruled,
    },
    // Computed: a link or the dismiss raises the minimum height to --fgd-size-hit.
    interactive: {
      true: styles.interactive,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'bar',
    voice: 'standard',
    record: false,
    ruled: true,
  },
})

type AnnouncementBarVariants = Omit<VariantProps<typeof announcementBar>, 'interactive'>

/** The fields a full-container bar may take [D180]: never `pink`, never `royal`. */
export type AnnouncementField = 'forest' | 'leaf' | 'amber' | 'brick'

/** The countdown: boxed digits to an end time, which print as the end date. */
export interface AnnouncementCountdown {
  /** The end, a Date or an ISO 8601 string. */
  end: Date | string
  /** The text that replaces the digits at zero, e.g. "Sale ended". */
  expired: React.ReactNode
  /**
   * The printed end date line. Default "Ends 30 Sept 2026", formatted from
   * `end` in `locale` and the reader's time zone once the page has loaded.
   */
  endLabel?: string
  /** The locale for the default end label. Default `en-GB`. */
  locale?: string
  /** Unit labels after the day, hour and minute cells. Default `d`, `h`, `min`. */
  units?: readonly [days: string, hours: string, minutes: string]
}

interface AnnouncementBarCommonProps extends Omit<
  React.ComponentPropsWithRef<'aside'>,
  'children'
> {
  /** The message: one short notice, authored; ≤ 2 lines at base, 1 from `--md-n-above`. */
  children: React.ReactNode
  /**
   * The one link, after the message: underlined at rest in `--role-accent`
   * (§9.3 body link); it prints its short URL.
   */
  link?: { href: string; label: React.ReactNode }
  /**
   * `standard` (default): caps `type-label`, centered. `mono`: `type-data`
   * caps for dated or technical notices ("CLOSED 24–26 DEC"). `dual`: the
   * caps run plus one serif caps phrase, `AnnouncementBarAccent`.
   */
  voice?: AnnouncementBarVariants['voice']
  /**
   * A notice of record (a legal change, a recall): it prints once, between
   * two 0.75 pt rules. Default `false`: the bar is hidden in print.
   */
  record?: boolean
  /** Boxed countdown digits; a polite live region announces at most once a minute. */
  countdown?: AnnouncementCountdown
  /** Adds the dismiss button (`close`, in a 44 px target). Default `false`. */
  dismissible?: boolean
  /** The dismiss button's accessible name. Default "Dismiss announcement". */
  dismissLabel?: string
  /**
   * Remembers the dismissal per viewer under this key (browser storage), so
   * the bar stays gone on later visits. Change the key for a new notice.
   */
  storageKey?: string
  /** Called after the bar is dismissed. */
  onDismiss?: () => void
  /**
   * Primary Radix scale: message, digits, cells, glyph and focus ring. Never
   * defaulted; omitted, it inherits the bar's preset [D133].
   */
  primary?: AnnouncementBarVariants['primary']
  /** Secondary Radix scale: the link underline and its hover ink. Never defaulted. */
  secondary?: AnnouncementBarVariants['secondary']
}

interface AnnouncementBarBarProps extends AnnouncementBarCommonProps {
  /**
   * `bar` (default): a full-bleed page-ground bar with its bottom rule.
   * `field`: a full-container field with its `--primary12` edge [D180].
   */
  kind?: 'bar'
  /**
   * The bar's page ground: `white`, `paper` or the page's pastel. Omitted,
   * the bar sits on the surrounding page ground.
   */
  preset?: PageGroundPreset
  /** The bottom rule is required on every page-ground bar. */
  ruled?: true
}

interface AnnouncementBarFieldProps extends AnnouncementBarCommonProps {
  kind: 'field'
  /** The field: `forest` (default), `leaf`, `amber` or `brick`, counted against its ration [D177]. */
  preset?: AnnouncementField
  /** A field draws its `--primary12` edge instead of the rule. */
  ruled?: false
}

/**
 * Props for AnnouncementBar: `aside` props, the message, link, voice,
 * record, countdown and dismissal, the kind with its preset, and the color
 * axes. `ruled` is required with `kind: bar` and excluded with `kind: field`.
 */
export type AnnouncementBarProps = AnnouncementBarBarProps | AnnouncementBarFieldProps

const STORAGE_PREFIX = 'fg-announcement-dismissed:'

function readDismissed(key: string | undefined): boolean {
  if (!key) return false
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key) === '1'
  } catch {
    return false
  }
}

function writeDismissed(key: string | undefined) {
  if (!key) return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, '1')
  } catch {
    // Storage may be unavailable (private window, blocked site data); the bar still goes.
  }
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Remaining whole days, hours and minutes to `end`, or null once it has passed. */
function remaining(end: Date, now: number) {
  const total = Math.floor((end.getTime() - now) / 60000)
  if (total <= 0) return null
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60,
  }
}

function Countdown({ countdown }: { countdown: AnnouncementCountdown }) {
  const { expired, locale = 'en-GB', units = ['d', 'h', 'min'] } = countdown
  const end = toDate(countdown.end)
  // Server rendering cannot know "now": the digits fill in after mount.
  const [now, setNow] = React.useState<number | null>(null)

  React.useEffect(() => {
    setNow(Date.now())
    // One update a minute: digits never flip or pulse, and the polite
    // region announces at most once a minute.
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  // Formatted in the reader's time zone, so only once mounted (print comes later).
  const endLabel =
    countdown.endLabel ??
    (now == null
      ? null
      : `Ends ${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(end)}`)
  const left = now == null ? undefined : remaining(end, now)

  if (left === null) {
    return <span className={styles.countdown}>{expired}</span>
  }

  const cells: Array<[number | undefined, string]> = [
    [left?.days, units[0]],
    [left?.hours, units[1]],
    [left?.minutes, units[2]],
  ]
  const spoken =
    left == null
      ? ''
      : `${left.days} ${units[0]}, ${left.hours} ${units[1]}, ${left.minutes} ${units[2]} left`

  return (
    <time className={styles.countdown} dateTime={end.toISOString()}>
      <span className={styles.cells} aria-hidden="true">
        {cells.map(([value, unit]) => (
          <span key={unit} className={styles.cellGroup}>
            <span className={styles.cell}>{value == null ? '––' : pad(value)}</span>
            <span className={styles.unit}>{unit}</span>
          </span>
        ))}
      </span>
      <span className={styles.visuallyHidden} aria-live="polite">
        {spoken}
      </span>
      <span className={styles.endDate}>{endLabel}</span>
    </time>
  )
}

/**
 * The announcement bar. Never sticky, never rotating, never truncated with
 * an ellipsis; it scrolls away with the page. Hidden in print unless it is
 * a `record`, whose countdown prints its end date.
 */
export function AnnouncementBar(props: AnnouncementBarProps) {
  const {
    kind,
    preset,
    ruled: _ruled,
    voice,
    record,
    link,
    countdown,
    dismissible,
    dismissLabel = 'Dismiss announcement',
    storageKey,
    onDismiss,
    primary,
    secondary,
    className,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const resolvedKind = kind ?? 'bar'
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    if (readDismissed(storageKey)) setDismissed(true)
  }, [storageKey])

  if (dismissed) return null

  const dismiss = () => {
    writeDismissed(storageKey)
    setDismissed(true)
    onDismiss?.()
  }

  const variants = {
    kind: resolvedKind,
    voice,
    record,
    ruled: resolvedKind === 'bar',
    interactive: link != null || dismissible === true,
    className,
  }
  const classes = announcementBar({ ...variants, primary, secondary })

  const content = (
    <>
      <p className={styles.message}>
        {children}
        {link ? (
          <>
            {' '}
            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </>
        ) : null}
      </p>
      {countdown ? <Countdown countdown={countdown} /> : null}
      {dismissible ? (
        <BaseButton
          className={`${styles.dismiss} ${iconHost}`}
          aria-label={dismissLabel}
          onClick={dismiss}
        >
          <Icon name="close" weight="interactive" />
        </BaseButton>
      ) : null}
    </>
  )

  const aside = { ...rest, 'aria-label': rest['aria-label'] ?? 'Announcement' }

  if (resolvedKind === 'field') {
    return (
      <aside {...aside} {...scope} className={classes}>
        <div className={styles.container}>
          <Ground
            kind="field"
            preset={(preset as AnnouncementField | undefined) ?? 'forest'}
            render={<div />}
            className={styles.fieldBar}
          >
            {content}
          </Ground>
        </div>
      </aside>
    )
  }

  const inner = <div className={styles.container}>{content}</div>

  if (preset) {
    return (
      <Ground
        {...aside}
        kind="band"
        preset={preset as PageGroundPreset}
        // The color props override the preset on the Ground itself.
        primary={primary ?? undefined}
        secondary={secondary ?? undefined}
        render={<aside />}
        className={announcementBar(variants)}
      >
        {inner}
      </Ground>
    )
  }

  return (
    <aside {...aside} {...scope} className={classes}>
      {inner}
    </aside>
  )
}

/** Props for AnnouncementBarAccent: `span` props. */
export type AnnouncementBarAccentProps = React.ComponentPropsWithRef<'span'>

/**
 * The dual voice's one serif caps phrase, set inside the message at the
 * run's cap height. Use it once, with `voice="dual"`.
 */
export function AnnouncementBarAccent(props: AnnouncementBarAccentProps) {
  const { className, ...rest } = props
  return <span {...rest} className={className ? `${styles.accent} ${className}` : styles.accent} />
}
