'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './expanding-box.module.css'

/*
 * Expanding box: the frame the search trigger morphs out of and into its
 * dialog (§9.10 [D194]). Behavior-free: it only names its pieces for View
 * Transitions while `active`; the owner runs the morph with
 * startExpandingTransition.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: expanding-box.module.css; CVA function `expandingBox`, applied
 *   to each of the three rows (head, content, foot), which render as direct
 *   children of the owner's host element.
 * - Axes: `collapsed` → `collapsed` (the field edge color, the hover edge
 *   step and the focus-ring piece); `primary`, `secondary` → scales module
 *   classes. Radius and edge weight are the same in both states.
 * - Compound variants: none. Defaults: `collapsed: false`; color axes: none
 *   [D133].
 * - `sheet` draws nothing of its own: the frame is the same in every
 *   layout. It marks the rows `data-sheet` for the owner, which insets its
 *   host by the page margin below --md-n-above.
 * - Transition names: `${name}-${piece}` for piece ∈ content, face, l, r,
 *   main, end, extra, tl, t, tr, bl, b, br, set per instance as inline custom
 *   properties on the rows (`none` while not active); `${name}-focus` while
 *   `collapsed`. The global rules live in utils/view-transitions.css.
 * - Parts: host and end (exported in `expandingBoxParts`), ExpandingBoxMain,
 *   ExpandingBoxExtra.
 * - States: host :hover (collapsed) → the edge step --role-rule →
 *   --primary12 [D140]; host :focus-visible (collapsed) → the ring on the
 *   box; <html data-fgd-expanding="close"> → the `closing` class; a
 *   collapsed box made active during a close → `landing` (its frame stays
 *   --primary12 until the morph finishes, then eases to --role-rule).
 */
export const expandingBox = cva(styles.row, {
  variants: {
    collapsed: {
      true: styles.collapsed,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    collapsed: false,
  },
})

type ExpandingBoxVariants = VariantProps<typeof expandingBox>

/** Class names for the owner's elements. */
export const expandingBoxParts = {
  /**
   * On the owner's element that hosts the rows (the trigger button, the
   * dialog popup): positions the box and hands its focus ring to the box.
   */
  host: styles.host,
  /**
   * On one element inside `ExpandingBoxMain` that rides the right edge (the
   * shortcut hint, the esc or close button). At most one displayed per box.
   */
  end: styles.end,
} as const

/** Props for ExpandingBox. */
export type ExpandingBoxProps = {
  /**
   * The pair's name base, shared by the two boxes that morph into each other
   * (trigger and dialog). Get it once in the owner with `useExpandingBoxName()`,
   * so two pairs never collide.
   */
  name: string
  /** This box holds the transition names now. Exactly one box of a pair is active at a time. Default `false`. */
  active?: boolean
  /** Trigger-sized state: the field edge color (`--role-rule`), hover edge step, focus-ring hand-off. Default `false`. */
  collapsed?: boolean
  /**
   * The expanded box is the dialog's sheet below `--md-n-above`. The box keeps
   * its radius and frame; the owner insets the host by the page margin (and
   * the safe areas). Marks the rows `data-sheet`. Default `false`.
   */
  sheet?: boolean
  /** `span` inside phrasing-only hosts such as a `<button>`. Default `'div'`. */
  as?: 'div' | 'span'
  /** On the content wrapper. */
  className?: string
  /** `ExpandingBoxMain`, then an optional `ExpandingBoxExtra`, then anything else (unnamed, such as a stats row). */
  children: React.ReactNode
  /**
   * Primary Radix scale: edges (hover and expanded `--primary12`), face
   * (`--primary1`), focus ring. Never defaulted; omitted, it inherits the
   * scope [D133].
   */
  primary?: ExpandingBoxVariants['primary']
  /** Secondary Radix scale, accepted for the shared color contract; no part draws in it today. Never defaulted. */
  secondary?: ExpandingBoxVariants['secondary']
}

/** Props for ExpandingBoxMain and ExpandingBoxExtra: HTML attributes and a ref. */
export type ExpandingBoxPartProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

type BoxContextValue = { as: 'div' | 'span' }

const BoxContext = React.createContext<BoxContextValue>({ as: 'div' })
BoxContext.displayName = 'ExpandingBoxContext'

/** Inline custom properties: the per-instance transition names. */
type NameVars = React.CSSProperties & Record<`--xb-${string}`, string>

/**
 * A 9-slice frame in three rows (head, content, foot), rendered as direct
 * children of the host (give that element `expandingBoxParts.host`). Each
 * row carries the scope attributes and the scale classes. While `active`,
 * its pieces carry View Transition names, so the owner's
 * `startExpandingTransition` morphs this box into the pair's other box:
 * corners translate, edges stretch, main rides the left edge, `end` the
 * right, and the extra grows.
 */
export function ExpandingBox(props: ExpandingBoxProps): React.JSX.Element {
  const {
    name,
    active = false,
    collapsed = false,
    sheet = false,
    as = 'div',
    className,
    children,
    primary,
    secondary,
  } = props
  const scope = useScopeAttributes()
  const context = React.useMemo<BoxContextValue>(() => ({ as }), [as])
  const Element = as

  // The landing trigger: a collapsed box made active while a close morph runs.
  // It keeps the expanded color in the new snapshot and until the morph ends.
  const [landing, setLanding] = React.useState(false)
  const wasActive = React.useRef(active)
  React.useLayoutEffect(() => {
    const was = wasActive.current
    wasActive.current = active
    if (collapsed && active && !was && document.documentElement.dataset.fgdExpanding === 'close') {
      setLanding(true)
    } else if (!active) {
      setLanding(false)
    }
  }, [active, collapsed])
  React.useEffect(() => {
    if (!landing) return undefined
    const root = document.documentElement
    const settle = () => {
      if (root.dataset.fgdExpanding == null) setLanding(false)
    }
    const observer = new MutationObserver(settle)
    observer.observe(root, { attributes: true, attributeFilter: ['data-fgd-expanding'] })
    settle()
    return () => observer.disconnect()
  }, [landing])

  const piece = (kind: string) => (active ? `${name}-${kind}` : 'none')
  const rowClassName = cx(
    expandingBox({ collapsed, primary, secondary }),
    landing && styles.landing
  )
  const state = {
    'data-active': active ? '' : undefined,
    'data-collapsed': collapsed ? '' : undefined,
    'data-sheet': sheet ? '' : undefined,
  }

  const headNames: NameVars = {
    '--xb-tl': piece('tl'),
    '--xb-t': piece('t'),
    '--xb-tr': piece('tr'),
  }
  const footNames: NameVars = {
    '--xb-bl': piece('bl'),
    '--xb-b': piece('b'),
    '--xb-br': piece('br'),
  }
  const contentNames: NameVars = {
    '--xb-content': piece('content'),
    '--xb-face': piece('face'),
    '--xb-l': piece('l'),
    '--xb-r': piece('r'),
    '--xb-main': piece('main'),
    '--xb-end': piece('end'),
    '--xb-extra': piece('extra'),
    // The ring's piece lives on the collapsed box whether or not it is active.
    '--xb-focus': collapsed ? `${name}-focus` : 'none',
  }

  return (
    <BoxContext.Provider value={context}>
      <Element {...scope} {...state} className={cx(rowClassName, styles.head)} style={headNames}>
        <Element className={cx(styles.corner, styles.tl)} />
        <Element className={cx(styles.edge, styles.t)} />
        <Element className={cx(styles.corner, styles.tr)} />
      </Element>
      <Element
        {...scope}
        {...state}
        className={cx(rowClassName, styles.content)}
        style={contentNames}
      >
        <Element className={styles.face} />
        <Element className={styles.left} />
        <Element className={styles.right} />
        <Element className={cx(styles.inner, className)}>
          {children}
          <Element className={styles.extraFallback} />
        </Element>
      </Element>
      <Element {...scope} {...state} className={cx(rowClassName, styles.foot)} style={footNames}>
        <Element className={cx(styles.corner, styles.bl)} />
        <Element className={cx(styles.edge, styles.b)} />
        <Element className={cx(styles.corner, styles.br)} />
      </Element>
    </BoxContext.Provider>
  )
}

/**
 * The main piece (trigger: icon, label and shortcut hint; dialog: the input
 * row). Rides the left edge. Renders the box's `as`.
 */
export function ExpandingBoxMain(props: ExpandingBoxPartProps): React.JSX.Element {
  const { className, ...rest } = props
  const Element = React.useContext(BoxContext).as as React.ElementType
  return <Element {...rest} className={cx(styles.main, className)} />
}

/**
 * The extra piece (dialog: the results). If omitted, the box renders an
 * empty one, so the trigger's empty extra grows into the dialog's.
 */
export function ExpandingBoxExtra(props: ExpandingBoxPartProps): React.JSX.Element {
  const { className, ...rest } = props
  const Element = React.useContext(BoxContext).as as React.ElementType
  return <Element {...rest} className={cx(styles.extra, className)} />
}

/**
 * A pair name from `useId()`, sanitized to a custom-ident: `fgd-xb-<id>` with
 * `[^A-Za-z0-9_-]` replaced by `-`. Call it once in the owner and pass it to
 * both boxes of the pair.
 */
export function useExpandingBoxName(): string {
  const id = React.useId()
  return `fgd-xb-${id.replace(/[^A-Za-z0-9_-]/g, '-')}`
}
