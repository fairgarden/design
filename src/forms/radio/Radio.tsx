'use client'

import * as React from 'react'
import { Radio as BaseRadio } from '@base-ui/react/radio'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../../foundations/ground'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { overlayScope, useScopeAttributes } from '../../utils/scope'
import { StatusGlyph, statusScales } from '../../utils/StatusGlyph'

import styles from './radio.module.css'

/*
 * Radio (§10.8).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: radio.module.css; CVA function `radio`.
 * - Axes: `kind` → standard | pill | swatch (circle plus label; the option
 *   pill; the color disc) [D155], classes `standard`, `pill`, `kindSwatch`
 *   (prefixed: the `swatch` part owns the bare name); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind standard (or the enclosing RadioGroup's kind); color
 *   axes none [D133].
 * - Color fallback: inherits the scope; its secondary drives the
 *   --role-select aliases, never the danger scale. RadioFeedback computes
 *   its secondary from its status (success green, danger red).
 * - States: data-checked → --role-select fill, --role-select-mark ●,
 *   circle edge --border-size-2-25 --role-select-edge; pill fill --role-select
 *   with a --border-size-2 --role-select-edge edge and a leading ● (read
 *   through :has()); swatch ring --border-size-2-25 outside a --size-px-1 gap
 *   plus the mark; :hover (not disabled, not read-only) [D181] → an
 *   unchecked circle's fill --role-soft-hover (--primary3 where soft fills
 *   apply), a checked circle's or pill's fill --role-select-hover, edges
 *   and swatch ring unchanged, an unchecked pill's edge --role-rule →
 *   --primary12 [D140], the standard and swatch labels the bare-text
 *   underline; :focus-visible → ring;
 *   data-disabled → dotted edge, --role-muted; data-readonly → rest roles,
 *   no hover; data-invalid → no change (the group message carries it).
 * - Parts: base (the row, a <label>), circle (Radio.Root), indicator,
 *   label, description, swatch, swatchMark, edge / edgeLine (the disabled
 *   dotted edge), and feedback (its own function `radioFeedback`, with
 *   feedbackGlyph and feedbackWord).
 * - Scope: `swatchMark` is a nested overlay-face (`white`) Ground;
 *   otherwise none.
 * - Container: none of its own; the RadioGroup root is `radio-group`.
 */
export const radio = cva(styles.base, {
  variants: {
    kind: {
      standard: styles.standard,
      pill: styles.pill,
      swatch: styles.kindSwatch,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'standard',
  },
})

type RadioVariants = VariantProps<typeof radio>

/** The structural build of a Radio (§10.8). */
export type RadioKind = NonNullable<RadioVariants['kind']>

/** The kind a RadioGroup passes to the radios inside it. A radio's own `kind` wins. */
export const RadioKindContext = React.createContext<RadioKind | undefined>(undefined)
RadioKindContext.displayName = 'RadioKindContext'

/**
 * Props for Radio: Base UI Radio.Root props (on the circle) plus the kind,
 * color axes and the row's content. `className` goes on the row.
 */
export type RadioProps<Value = unknown> = Omit<
  BaseRadio.Root.Props<Value>,
  'className' | 'children'
> & {
  /**
   * `standard` (default): circle plus label. `pill`: a stacked
   * `--size-px-8` option pill. `swatch`: a color disc whose name is the
   * accessible label (shown in print). Inside a RadioGroup the group's kind
   * is the default.
   */
  kind?: RadioVariants['kind']
  /**
   * Primary Radix scale: circle edge, labels, swatch rings and focus ring.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: RadioVariants['primary']
  /**
   * Secondary Radix scale: the checked fill, dot and edge through
   * --role-select. Omitted, it inherits the scope. Never the danger scale.
   */
  secondary?: RadioVariants['secondary']
  /** Class for the row (the `base` part). */
  className?: string
  /** The label, authored in title case up to about four words [D160]; a swatch's color name. */
  children?: React.ReactNode
  /** Optional helper text under the label, in sentence case. */
  description?: React.ReactNode
  /**
   * `swatch` only: the disc's color or image, as a CSS `background` value.
   * The color is content, not a role; its name is `children`.
   */
  swatch?: string
  /** Quiz feedback shown after the label: a RadioFeedback. */
  feedback?: React.ReactNode
}

function DisabledEdge() {
  return (
    <svg className={styles.edge} aria-hidden="true" focusable="false">
      <rect className={styles.edgeLine} width="100%" height="100%" />
    </svg>
  )
}

/**
 * A Base UI Radio inside its own label row, so the whole row is the hit
 * target. Always inside a RadioGroup. Checked is a --role-select fill, an
 * 8 px ● in --role-select-mark and a 3 px edge, never fill alone [D15].
 */
export function Radio<Value>(props: RadioProps<Value>) {
  const {
    kind,
    primary,
    secondary,
    className,
    children,
    description,
    swatch,
    feedback,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const groupKind = React.useContext(RadioKindContext)
  const resolvedKind: RadioKind = kind ?? groupKind ?? 'standard'
  const isSwatch = resolvedKind === 'swatch'
  const isPill = resolvedKind === 'pill'

  return (
    <label
      {...scope}
      className={radio({ kind: resolvedKind, primary, secondary, className })}
    >
      <BaseRadio.Root {...rest} className={styles.circle}>
        {isSwatch ? (
          <span
            className={styles.swatch}
            style={swatch ? { background: swatch } : undefined}
            aria-hidden="true"
          />
        ) : null}
        <BaseRadio.Indicator className={styles.indicator}>
          {isSwatch ? (
            <Ground
              kind="face"
              preset={overlayScope.ground}
              render={<span />}
              className={styles.swatchMark}
            />
          ) : null}
        </BaseRadio.Indicator>
        {isPill ? null : <DisabledEdge />}
      </BaseRadio.Root>
      {children == null ? null : <span className={styles.label}>{children}</span>}
      {description == null ? null : (
        <span className={styles.description}>{description}</span>
      )}
      {feedback}
      {isPill ? <DisabledEdge /> : null}
    </label>
  )
}

/** Quiz feedback status (§10.8). */
export type RadioFeedbackStatus = 'success' | 'danger'

/*
 * RadioFeedback: `status` selects the glyph, the default word and the
 * computed secondary; like the Alert's status it carries no class.
 */
export const radioFeedback = cva(styles.feedback, {
  variants: {
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type RadioFeedbackVariants = VariantProps<typeof radioFeedback>

const feedbackWords: Record<RadioFeedbackStatus, string> = {
  success: 'Correct',
  danger: 'Not quite',
}

/** Props for RadioFeedback: `span` props, the status, the word and the color axes. */
export type RadioFeedbackProps = Omit<React.ComponentPropsWithRef<'span'>, 'color'> & {
  /** `success` for the correct answer, `danger` for a wrong pick. */
  status: RadioFeedbackStatus
  /** Primary Radix scale: the word. Never defaulted [D133]. */
  primary?: RadioFeedbackVariants['primary']
  /** Secondary Radix scale: the glyph. Omitted, the status scale (green or red). */
  secondary?: RadioFeedbackVariants['secondary']
  /** The word; defaults to "Correct" or "Not quite". */
  children?: React.ReactNode
}

/**
 * Quiz feedback for a Radio's `feedback` slot: the §1.5.4 success glyph
 * (● with its check) or danger glyph (◆ with its ×) in --role-status,
 * always paired with a word, so fill is never the only signal [D58].
 */
export function RadioFeedback(props: RadioFeedbackProps) {
  const { status, primary, secondary, className, children, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <span
      {...rest}
      {...scope}
      className={radioFeedback({
        primary,
        secondary: secondary ?? statusScales[status],
        className,
      })}
    >
      <StatusGlyph status={status} className={styles.feedbackGlyph} />
      <span className={styles.feedbackWord}>{children ?? feedbackWords[status]}</span>
    </span>
  )
}
