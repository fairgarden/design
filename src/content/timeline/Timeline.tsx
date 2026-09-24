'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link, type LinkProps } from '../../actions/link'
import { Marker } from '../../utils/Ornament'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './timeline.module.css'

/*
 * Timeline & Agenda (§12.14): ordered milestones, or a dated agenda of
 * sessions. Composed from an `ol` of entries (`time` + heading + text);
 * agenda day groups are `section`s with a date heading. Markers and the
 * spine are decorative SVG (`aria-hidden`); every state they show is also
 * in words. §8.11 owns the method (spine, marker grammar, date keys).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: timeline.module.css; CVA functions `timeline` and
 *   `timelineEntry`.
 * - Axes: `kind` → trail | agenda | date-block → `trail`, `agenda`,
 *   `dateBlock`; `ongoing` → `ongoing` (the terminal marker sits past the
 *   last entry); `primary`, `secondary` → scales module classes.
 *   `timelineEntry`: `stage` → past | current | planned (state classes on
 *   an unmanaged element; default planned).
 * - Compound variants: none.
 * - Defaults: kind trail, ongoing false; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: the `stage` classes on `entry`, plus `aria-current="step"` on
 *   the current entry; a linked entry's title Link (§9.3) owns hover and
 *   press, and `entry:has(titleLink:focus-visible)` draws the ring around
 *   the entry; long entries compose Collapsible (§10.13).
 * - Parts: base, list, entry, dateKey, rail, spine (the SVG line in
 *   `spineBox`; composes line-dashed, whose border fallback a line ignores),
 *   marker (the box holding the shared §4.7 markers, utils/Ornament: origin,
 *   waypoint, terminal or current at the timeline size), body, title,
 *   titleLink, text, caption, dateStack (the date-block key: month, day,
 *   weekday); agenda: day, dateHead, scope, session, sessionMarker,
 *   sessionTitle, meta, description.
 * - Scope: none.
 * - Container: `base` is the inline-size container `timeline`; the entry
 *   layout (date key, spine, entries) queries it. Baseline without
 *   support: spine at the left margin, dates above titles, with viewport
 *   fallbacks of the date key column from --md-n-above and the 3 / gutter
 *   / 7 layout from --lg-n-above. Thresholds (§5.10.2): key 2/8 left of the
 *   spine from 768; key 3, spine in the gutter, entries 7 from 1024 [D163].
 */
export const timeline = cva(styles.base, {
  variants: {
    kind: {
      trail: styles.trail,
      agenda: styles.agenda,
      'date-block': styles.dateBlock,
    },
    ongoing: {
      true: styles.ongoing,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'trail',
    ongoing: false,
  },
})

/** Entry state classes (unmanaged element): the stage of a milestone. */
export const timelineEntry = cva(styles.entry, {
  variants: {
    stage: {
      past: styles.past,
      current: styles.current,
      planned: styles.planned,
    },
  },
  defaultVariants: {
    stage: 'planned',
  },
})

type TimelineVariants = VariantProps<typeof timeline>

/** The three timeline builds (§12.14). */
export type TimelineKind = 'trail' | 'agenda' | 'date-block'

/** A milestone's stage: past and planned keep the waypoint X (told apart by words); current is "now". */
export type TimelineStage = 'past' | 'current' | 'planned'

/** The §4.7 marker set drawn on the spine. */
export type TimelineMarker = 'origin' | 'waypoint' | 'terminal' | 'current'

interface TimelineContextValue {
  kind: TimelineKind
  ongoing: boolean
}

const TimelineContext = React.createContext<TimelineContextValue>({
  kind: 'trail',
  ongoing: false,
})
TimelineContext.displayName = 'TimelineContext'

/** Props for Timeline: `section` props, `render`, the kind, `ongoing` and the color axes. */
export type TimelineProps = useRender.ComponentProps<'section'> & {
  /**
   * `trail` (default): a straight dashed spine with the §4.7 markers
   * (origin, waypoints, terminal, "now"). `agenda`: date heads, a scope
   * caption and sessions led by the » marker. `date-block`: a stacked
   * date block (month / day / weekday) in a fixed key column, no spine.
   */
  kind?: TimelineKind
  /**
   * The timeline continues: the last entry keeps a waypoint and the
   * terminal marker sits past it. Default `false`.
   */
  ongoing?: boolean
  /**
   * Primary Radix scale: markers, date keys, titles and text. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: TimelineVariants['primary']
  /**
   * Secondary Radix scale: the spine, the agenda's » markers
   * (`--role-accent`), title-link underlines and the date heads on light
   * grounds (`--role-heading`). Never defaulted.
   */
  secondary?: TimelineVariants['secondary']
}

/**
 * The timeline module: a `TimelineList` of `TimelineEntry`s (trail and
 * date-block), or `TimelineDay`s holding a `TimelineDateHead`, a
 * `TimelineScope` and a `TimelineList` of `TimelineSession`s (agenda). A
 * `TimelineCaption` defines the current marker. Entries never alternate
 * sides; the spine is always dashed [D174].
 */
export function Timeline(props: TimelineProps) {
  const {
    render,
    ref,
    className,
    kind = 'trail',
    ongoing = false,
    primary,
    secondary,
    ...rest
  } = props
  const scope = useScopeAttributes()
  const context = React.useMemo<TimelineContextValue>(() => ({ kind, ongoing }), [kind, ongoing])
  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>(
      {
        ...scope,
        className: timeline({ kind, ongoing, primary, secondary, className }),
      },
      rest
    ),
  })
  return <TimelineContext.Provider value={context}>{element}</TimelineContext.Provider>
}

/** Props for TimelineList: `ol` props and `render`. */
export type TimelineListProps = useRender.ComponentProps<'ol'>

/**
 * The ordered entries (or an agenda day's sessions). On an ongoing trail it
 * closes with the terminal marker past the last entry.
 */
export function TimelineList(props: TimelineListProps) {
  const { render, ref, className, children, ...rest } = props
  const { kind, ongoing } = React.useContext(TimelineContext)
  return useRender({
    defaultTagName: 'ol',
    render,
    ref,
    props: mergeProps<'ol'>(
      {
        className: cx(styles.list, className),
        children: (
          <>
            {children}
            {kind === 'trail' && ongoing ? (
              <li className={styles.end} aria-hidden="true">
                <span className={styles.rail}>
                  <MarkerGlyph fixed="terminal" />
                </span>
              </li>
            ) : null}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for TimelineEntry: list-item props, `render`, the stage, the date key and a marker override. */
export type TimelineEntryProps = useRender.ComponentProps<'li'> & {
  /**
   * `planned` (default): waypoint X, and say "Planned" in the date key.
   * `past`: waypoint X; the date (or "Past") carries it, never dimmed.
   * `current`: the solid "now" dot, `aria-current="step"`, and its dated
   * label ("Today, 22 Sep 2026") in words.
   */
  stage?: TimelineStage
  /**
   * The date key: a `time` element (`type-data`), or a `TimelineDateStack`
   * in the date-block kind. Above the title at base; a column left of the
   * spine from 768 px of container.
   */
  date?: React.ReactNode
  /**
   * Overrides the marker. By default the first entry draws the origin
   * circle, the last the terminal triangle (unless the timeline is
   * ongoing), the rest waypoint X's, and the current entry the "now" dot.
   */
  marker?: TimelineMarker
}

/**
 * One milestone: its date key, the spine with its marker, and the body
 * (`TimelineTitle`, `TimelineText`). Entries never split across pages.
 */
export function TimelineEntry(props: TimelineEntryProps) {
  const { render, ref, className, stage = 'planned', date, marker, children, ...rest } = props
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        'aria-current': stage === 'current' ? 'step' : undefined,
        className: timelineEntry({ stage, className }),
        children: (
          <>
            {date != null ? <div className={styles.dateKey}>{date}</div> : null}
            <span className={styles.rail} aria-hidden="true">
              <MarkerGlyph fixed={marker} />
              <svg className={styles.spineBox} focusable="false">
                <line className={styles.spine} x1="50%" y1="0" x2="50%" y2="100%" />
              </svg>
            </span>
            <div className={styles.body}>{children}</div>
          </>
        ),
      },
      rest
    ),
  })
}

/**
 * The §4.7 markers at the timeline size (§1.5.16), from the shared ornament
 * utilities: origin, an open circle at --ds-marker-timeline; waypoint, a
 * stroked X at --ds-marker-waypoint; terminal, an open triangle at
 * --ds-marker-timeline pointing along the spine; current, a solid dot at
 * --ds-marker-current. Unfixed, CSS picks the shape from the entry's
 * position and stage.
 */
function MarkerGlyph({ fixed }: { fixed?: TimelineMarker }) {
  const shape = (name: TimelineMarker, className: string) =>
    fixed == null || fixed === name ? (
      <Marker
        kind={name}
        size="timeline"
        angle={90}
        className={fixed === name ? `${className} ${styles.markerFixed}` : className}
      />
    ) : null

  return (
    <span className={styles.marker} aria-hidden="true">
      {shape('origin', styles.markerOrigin)}
      {shape('waypoint', styles.markerWaypoint)}
      {shape('terminal', styles.markerTerminal)}
      {shape('current', styles.markerCurrent)}
    </span>
  )
}

/** Props for TimelineTitle: heading props and `render` (default `<h3>`). */
export type TimelineTitleProps = useRender.ComponentProps<'h3'>

/** The entry title: `type-itemhead` in `--primary12`, within the reading measure. Renders `<h3>`. */
export function TimelineTitle(props: TimelineTitleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(styles.title, className) }, rest),
  })
}

/** Props for TimelineTitleLink: Link props except `kind`, which is always `title`. */
export type TimelineTitleLinkProps = Omit<LinkProps, 'kind'>

/**
 * A linked entry's one link, inside `TimelineTitle`: a §9.3 title Link
 * whose hit area stretches over the entry; the entry draws the ring.
 */
export function TimelineTitleLink(props: TimelineTitleLinkProps) {
  const { className, ...rest } = props
  return <Link {...rest} kind="title" className={cx(styles.titleLink, className)} />
}

/** Props for TimelineText: `div` props and `render`. */
export type TimelineTextProps = useRender.ComponentProps<'div'>

/** The entry text: `type-body-ui` in `--primary12`. Put long entries in a Collapsible. */
export function TimelineText(props: TimelineTextProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.text, className) }, rest),
  })
}

/** Props for TimelineCaption: paragraph props and `render`. */
export type TimelineCaptionProps = useRender.ComponentProps<'p'>

/**
 * The legend line that defines the current marker, e.g. "● Today, 22 Sep
 * 2026" (§8.11): `type-caption` in `--primary12`. In print, write it as
 * "As of 22 Sep 2026".
 */
export function TimelineCaption(props: TimelineCaptionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.caption, className) }, rest),
  })
}

/** Props for TimelineDateStack: `time` props, `render` and the three lines. */
export type TimelineDateStackProps = Omit<useRender.ComponentProps<'time'>, 'children'> & {
  /** The month, e.g. "Jul": `type-label` caps. */
  month: React.ReactNode
  /** The day of the month: a large data numeral. */
  day: React.ReactNode
  /** The weekday, e.g. "Sat": `type-label` caps. */
  weekday?: React.ReactNode
}

/** The date-block key: MONTH / day / WEEKDAY, stacked. Pass `dateTime`. */
export function TimelineDateStack(props: TimelineDateStackProps) {
  const { render, ref, className, month, day, weekday, ...rest } = props
  return useRender({
    defaultTagName: 'time',
    render,
    ref,
    props: mergeProps<'time'>(
      {
        className: cx(styles.dateStack, className),
        children: (
          <>
            <span className={styles.dateMonth}>{month}</span>
            <span className={styles.dateDay}>{day}</span>
            {weekday != null ? <span className={styles.dateWeekday}>{weekday}</span> : null}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for TimelineDay: `section` props and `render`. */
export type TimelineDayProps = useRender.ComponentProps<'section'>

/** One agenda day: `TimelineDateHead`, `TimelineScope`, then a `TimelineList` of sessions. */
export function TimelineDay(props: TimelineDayProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>({ className: cx(styles.day, className) }, rest),
  })
}

/** Props for TimelineDateHead: heading props and `render` (default `<h3>`). */
export type TimelineDateHeadProps = useRender.ComponentProps<'h3'>

/** The agenda date head: `type-itemhead` in `--role-heading` (a group head). Renders `<h3>`. */
export function TimelineDateHead(props: TimelineDateHeadProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(styles.dateHead, className) }, rest),
  })
}

/** Props for TimelineScope: paragraph props and `render`. */
export type TimelineScopeProps = useRender.ComponentProps<'p'>

/** The scope caption, "All times are Eastern.": the time zone, stated once. */
export function TimelineScope(props: TimelineScopeProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.scope, className) }, rest),
  })
}

/** Props for TimelineSession: list-item props and `render`. */
export type TimelineSessionProps = useRender.ComponentProps<'li'>

/**
 * One agenda session, led by the » block marker in `--role-accent`:
 * `TimelineSessionTitle`, an optional `TimelineMeta` ("Happening now",
 * "Past") and a `TimelineDescription`.
 */
export function TimelineSession(props: TimelineSessionProps) {
  const { render, ref, className, children, ...rest } = props
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        className: cx(styles.session, className),
        children: (
          <>
            <svg
              className={styles.sessionMarker}
              viewBox="0 0 36 36"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M9 10l8 8-8 8M19 10l8 8-8 8" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className={styles.sessionBody}>{children}</div>
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for TimelineSessionTitle: heading props, `render` and the pipe-joined meta. */
export type TimelineSessionTitleProps = useRender.ComponentProps<'h4'> & {
  /**
   * Fields joined into the title with the serif's own pipe: "Title | Format
   * | Time". A no-break space precedes each pipe, so a pipe never starts a
   * line; leave out empty fields.
   */
  meta?: React.ReactNode[]
}

/** The session title, `type-itemhead` in `--primary12`, with its meta pipe-joined. Renders `<h4>`. */
export function TimelineSessionTitle(props: TimelineSessionTitleProps) {
  const { render, ref, className, meta, children, ...rest } = props
  const fields = (meta ?? []).filter((field) => field != null && field !== false && field !== '')
  return useRender({
    defaultTagName: 'h4',
    render,
    ref,
    props: mergeProps<'h4'>(
      {
        className: cx(styles.sessionTitle, className),
        children: (
          <>
            {children}
            {fields.map((field, index) => (
              <React.Fragment key={index}>
                {' | '}
                {field}
              </React.Fragment>
            ))}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for TimelineMeta: paragraph props and `render`. */
export type TimelineMetaProps = useRender.ComponentProps<'p'>

/** A session's meta line: `type-caption` in `--primary12` ("Happening now", "Past"). */
export function TimelineMeta(props: TimelineMetaProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.meta, className) }, rest),
  })
}

/** Props for TimelineDescription: `div` props and `render`. */
export type TimelineDescriptionProps = useRender.ComponentProps<'div'>

/** A session's description: `type-body-ui` in `--primary12`. */
export function TimelineDescription(props: TimelineDescriptionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.description, className) }, rest),
  })
}

