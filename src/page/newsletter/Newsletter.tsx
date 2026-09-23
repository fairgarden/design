'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import type { Form as BaseForm } from '@base-ui/react/form'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../../actions/button'
import { Checkbox } from '../../forms/checkbox'
import { Field, FieldError, FieldLabel } from '../../forms/field'
import { Form, FormRow } from '../../forms/form'
import { Ground } from '../../foundations/ground'
import { Input } from '../../forms/input'
import { StatusGlyph, statusLabels, statusScales } from '../../utils/StatusGlyph'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './newsletter.module.css'

/*
 * Newsletter Signup (§11.11): email capture as the inline footer form, the
 * straddle card, a band or a ruled row. A Base UI Form holding Field parts
 * (Label, Input, Error), an optional consent Checkbox and a submit Button;
 * the result renders in place, in a polite live region. Never a pop-up, a
 * multi-step flow or a modal.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: newsletter.module.css; CVA functions `newsletter` and
 *   `newsletterStatus`.
 * - Axes: `kind` → inline | straddle | band | ruled → same-named classes;
 *   `grained` → `grained` (the straddle card takes grain and its fields sit
 *   on `white` face plates, light islands); `reading` → `reading` (the
 *   straddle card on reference and editorial pages: from --lg-n-above it
 *   aligns to the reading column's start edge and widens to the reading
 *   measure [D187]); `primary`, `secondary` → scales module classes.
 *   `newsletterStatus`: `status` → success | warning (§1.5.4).
 * - Compound variants: none.
 * - Defaults: kind inline, grained false, reading false; color axes: none
 *   [D133].
 * - Color fallback: inherits the scope (or the card's `royal` field). The
 *   submit's own class aliases the scope's action scale (the butted cell's
 *   `solid` Button, or the §9.2 pill); the Field in error passes the danger
 *   scale; the status part takes green or amber as its secondary [D129].
 * - States: `aria-busy` on the form (from `busy`) → "Sending…" at the held
 *   width, no spinner [D84]; success replaces the form and takes focus.
 *   Field, Input, Checkbox and Button states live in their own modules
 *   (`data-invalid`, `data-focused`, `data-checked`, `data-disabled`, the
 *   D140 field hover, the D181 action hover). Legal links are §9.3 Links.
 * - Parts: base, card, content, layout, intro, icon, heading (bandHeading
 *   on the band), pitch,
 *   formArea, form, fields, consent, buttedCell (the Input's action cell),
 *   submit, legal, status (`newsletterStatus`: statusGlyph, statusText),
 *   printLine.
 * - Scope: `card` is a `royal` field (`<Ground kind="field">`, always dark)
 *   for `straddle`, the page's one royal card, or an optional `leaf` or
 *   `amber` campaign field for `band` [D177, D178]. On a grained card each
 *   field box is a `white` face plate (Input `plate`) [D149, D179].
 * - Container: `content` is the inline-size container named `newsletter`;
 *   the band's field-and-pill row (480) and 6 + 6 split (768) and the
 *   ruled row's three cells (768) query it. Baseline: the field row
 *   flex-wraps and the ruled row stacks, with viewport fallbacks at
 *   --md-n-above and --lg-n-above. The Form is its own `form` container, so
 *   Email and Postcode share a row from 480 px of form width. The straddle
 *   card's width cap is a frame rule on the viewport (§5.10.2) [D163].
 */
export const newsletter = cva(styles.base, {
  variants: {
    kind: {
      inline: styles.inline,
      straddle: styles.straddle,
      band: styles.band,
      ruled: styles.ruled,
    },
    grained: {
      true: styles.grained,
    },
    reading: {
      true: styles.reading,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'inline',
    grained: false,
    reading: false,
  },
})

/** The status part (§1.5.4): success (green) or a server-failure warning (amber). */
export const newsletterStatus = cva(styles.status, {
  variants: {
    status: {
      success: `${styles.success} ${secondaryScaleVariants[statusScales.success]}`,
      warning: `${styles.warning} ${secondaryScaleVariants[statusScales.warning]}`,
    },
  },
})

type NewsletterVariants = VariantProps<typeof newsletter>

/** The result of a submission, shown in place. */
export type NewsletterStatusKind = NonNullable<VariantProps<typeof newsletterStatus>['status']>

/** The values the form submits. */
export interface NewsletterValues {
  email: string
  postcode?: string
  consent?: boolean
}

/** The campaign fields a `band` newsletter may sit in [D177, D180]. */
export type NewsletterBandField = 'leaf' | 'amber'

type HeadingLevel = 2 | 3 | 4

interface NewsletterCommonProps extends Omit<
  useRender.ComponentProps<'section'>,
  'children' | 'onSubmit'
> {
  /**
   * The heading: `type-itemhead` (inline, straddle, ruled) or `type-h2`
   * in `--role-heading` (band). It names the section.
   */
  heading: React.ReactNode
  /** The heading level. Default `2`. */
  headingLevel?: HeadingLevel
  /** A one-line pitch, `type-body-ui`, ≤ 2 lines. */
  pitch?: React.ReactNode
  /**
   * The legal or consent line, `type-small` at weight 600; links are Links,
   * underlined at rest.
   */
  legal?: React.ReactNode
  /** The email field's visible label. Default "Email Address" (title case [D160]). */
  emailLabel?: string
  /** A placeholder: an example only, never the label; end it with "…". */
  emailPlaceholder?: string
  /** The error shown when the email is missing or malformed. */
  emailError?: React.ReactNode
  /**
   * Adds a postcode field (`true` labels it "Postcode"; a string is its
   * label). It shares Email's row from 480 px of form width.
   */
  postcode?: boolean | string
  /** Adds an optional consent Checkbox with this label. */
  consent?: React.ReactNode
  /**
   * The submit's label (and the butted cell's accessible name), title case,
   * untracked. Default "Subscribe".
   */
  submitLabel?: string
  /** The busy label, held at the rest width. Default "Sending…". */
  busyLabel?: string
  /** While the submission is pending: the form is inert and `aria-busy`. */
  busy?: boolean
  /**
   * The result: `success` replaces the form with the ● glyph, "Subscribed"
   * and `statusMessage`, and moves focus there; `warning` (a server
   * failure) shows the ▲ glyph and `statusMessage` above the submit.
   */
  status?: NewsletterStatusKind
  /** The one sentence that goes with the status. */
  statusMessage?: React.ReactNode
  /** The status word for success. Default "Subscribed". */
  successTitle?: React.ReactNode
  /** Called with the values once the form validates. */
  onSubscribe?: (values: NewsletterValues, details: BaseForm.SubmitEventDetails) => void
  /**
   * The short URL printed in place of the form: "Subscribe at
   * example.org/newsletter" (no protocol).
   */
  printUrl: string
  /** Primary Radix scale: text, field edges and focus rings. Never defaulted [D133]. */
  primary?: NewsletterVariants['primary']
  /** Secondary Radix scale: the icon, band heading and link underlines. Never defaulted. */
  secondary?: NewsletterVariants['secondary']
}

interface NewsletterInlineProps extends NewsletterCommonProps {
  /**
   * `inline` (default): the footer form, icon → heading → pitch → a field
   * with the butted 64 × 48 px submit cell. `straddle`: the `royal` card
   * across the night band's seam. `band`: a large headline with field and
   * pill, on the page ground or a campaign field. `ruled`: a ruled row of
   * prompt, input and square submit cells.
   */
  kind?: 'inline'
  /**
   * The block-tier icon before the heading (an envelope), an `aria-hidden`
   * SVG in `currentColor`, which takes `--role-accent`.
   */
  icon?: React.ReactNode
  grained?: never
  reading?: never
  field?: never
}

interface NewsletterStraddleProps extends NewsletterCommonProps {
  kind: 'straddle'
  icon?: never
  /** The card takes grain, and its fields sit on `white` face plates. Default `false`. */
  grained?: boolean
  /**
   * Reference and editorial pages: from `--lg-n-above` the card aligns to
   * the reading column's start edge and widens to the reading measure;
   * scene pages keep `--size-sm`, centered [D187]. Default `false`.
   */
  reading?: boolean
  field?: never
}

interface NewsletterBandProps extends NewsletterCommonProps {
  kind: 'band'
  icon?: never
  grained?: never
  reading?: never
  /** Sets the band in a campaign field (`leaf` or `amber`, the page's one campaign field). */
  field?: NewsletterBandField
}

interface NewsletterRuledProps extends NewsletterCommonProps {
  kind: 'ruled'
  icon?: never
  grained?: never
  reading?: never
  field?: never
}

/**
 * Props for Newsletter: `section` props, the kind (with its card options),
 * the heading and copy, the fields, the submission state, the print URL and
 * the color axes.
 */
export type NewsletterProps =
  NewsletterInlineProps | NewsletterStraddleProps | NewsletterBandProps | NewsletterRuledProps

const headingTags = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

/**
 * Lifts a straddle card across the seam of the band it opens: the seam
 * falls halfway through the gap between the heading and the first field
 * (§5.6.2), however the heading wraps. Writes --newsletter-overlap (px) on
 * the root; without script the card simply opens the lower band.
 */
function useStraddle(
  enabled: boolean,
  root: React.RefObject<HTMLElement | null>,
  heading: React.RefObject<HTMLElement | null>,
  after: React.RefObject<HTMLElement | null>,
) {
  React.useLayoutEffect(() => {
    const node = root.current
    if (!enabled || !node) return undefined
    const band = node.parentElement?.closest<HTMLElement>('[data-ground]') ?? null
    if (!band) return undefined

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const headingNode = heading.current
        const afterNode = after.current
        if (!headingNode || !afterNode) return
        const current = parseFloat(node.style.getPropertyValue('--newsletter-overlap')) || 0
        const top = node.getBoundingClientRect().top + current
        const headingBottom = headingNode.getBoundingClientRect().bottom + current
        const afterTop = afterNode.getBoundingClientRect().top + current
        const seamInCard = headingBottom - top + (afterTop - headingBottom) / 2
        const shift = top - band.getBoundingClientRect().top + seamInCard
        node.style.setProperty('--newsletter-overlap', `${Math.max(0, Math.round(shift))}px`)
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    observer.observe(band)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      node.style.removeProperty('--newsletter-overlap')
    }
  }, [enabled, root, heading, after])
}

/**
 * The newsletter signup. At most one per page besides the footer block;
 * when a page carries one, the footer shows only a link. In print it
 * becomes one 0.75 pt box: the heading and "Subscribe at <printUrl>".
 */
export function Newsletter(props: NewsletterProps) {
  const {
    kind,
    grained,
    reading,
    field,
    icon,
    heading,
    headingLevel = 2,
    pitch,
    legal,
    emailLabel = 'Email Address',
    emailPlaceholder,
    emailError = 'Enter an email address, like name@example.org.',
    postcode,
    consent,
    submitLabel = 'Subscribe',
    busyLabel = 'Sending…',
    busy = false,
    status,
    statusMessage,
    successTitle = 'Subscribed',
    onSubscribe,
    printUrl,
    primary,
    secondary,
    render,
    ref,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const headingId = React.useId()
  const resolvedKind = kind ?? 'inline'
  const HeadingTag = headingTags[headingLevel]
  const isStraddle = resolvedKind === 'straddle'

  const rootRef = React.useRef<HTMLElement | null>(null)
  const headingRef = React.useRef<HTMLHeadingElement | null>(null)
  const formAreaRef = React.useRef<HTMLDivElement | null>(null)
  const statusRef = React.useRef<HTMLDivElement | null>(null)
  useStraddle(isStraddle, rootRef, headingRef, formAreaRef)

  // Success replaces the form; focus moves to the message [D58].
  React.useEffect(() => {
    if (status === 'success') statusRef.current?.focus()
  }, [status])

  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.RefObject<HTMLElement | null>).current = node
    },
    [ref],
  )

  const postcodeLabel = postcode === true ? 'Postcode' : postcode || null
  const plate = isStraddle && grained === true
  const inlineCell = resolvedKind === 'inline'

  const statusNode =
    status != null ? (
      <div
        {...scope}
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={newsletterStatus({ status })}
      >
        <StatusGlyph status={status} className={styles.statusGlyph} label={null} />
        <p className={styles.statusText}>
          {status === 'success' ? (
            <>
              <strong className={styles.statusTitle}>{successTitle}</strong>
              {statusMessage != null ? <> {statusMessage}</> : null}
            </>
          ) : (
            <>
              <span className={styles.visuallyHidden}>{statusLabels.warning}: </span>
              {statusMessage}
            </>
          )}
        </p>
      </div>
    ) : null

  const emailField = (
    <Field name="email" className={styles.emailField}>
      <FieldLabel>{emailLabel}</FieldLabel>
      {inlineCell ? (
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder={emailPlaceholder}
          butted="end"
          action={{ label: submitLabel, busy, busyLabel }}
        />
      ) : (
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder={emailPlaceholder}
          plate={plate}
        />
      )}
      <FieldError>{emailError}</FieldError>
    </Field>
  )

  const postcodeField =
    postcodeLabel != null ? (
      <Field name="postcode" className={styles.postcodeField}>
        <FieldLabel optional>{postcodeLabel}</FieldLabel>
        <Input autoComplete="postal-code" plate={plate} style={{ maxInlineSize: '12ch' }} />
      </Field>
    ) : null

  const submit = inlineCell ? null : (
    <Button
      type="submit"
      variant="solid"
      size={resolvedKind === 'ruled' ? 'lg' : 'md'}
      aria-busy={busy || undefined}
      className={styles.submit}
    >
      {busy ? busyLabel : submitLabel}
    </Button>
  )

  const legalNode = legal != null ? <p className={styles.legal}>{legal}</p> : null

  const form =
    status === 'success' ? (
      statusNode
    ) : (
      <Form<Record<string, unknown>>
        busy={busy}
        className={styles.form}
        onFormSubmit={(values, details) => {
          onSubscribe?.(
            {
              email: String(values.email ?? ''),
              postcode: values.postcode == null ? undefined : String(values.postcode),
              consent: values.consent == null ? undefined : Boolean(values.consent),
            },
            details,
          )
        }}
      >
        <div className={styles.fields}>
          {postcodeField ? (
            <FormRow>
              {emailField}
              {postcodeField}
            </FormRow>
          ) : (
            emailField
          )}
          {resolvedKind === 'band' ? submit : null}
        </div>
        {consent != null ? (
          <Checkbox name="consent" className={styles.consent}>
            {consent}
          </Checkbox>
        ) : null}
        {statusNode}
        {isStraddle ? legalNode : null}
        {resolvedKind === 'band' ? null : submit}
        {isStraddle ? null : legalNode}
      </Form>
    )

  const content = (
    <div className={styles.content}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          {inlineCell && icon != null ? (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <HeadingTag
            ref={headingRef}
            id={headingId}
            className={resolvedKind === 'band' ? styles.bandHeading : styles.heading}
          >
            {heading}
          </HeadingTag>
          {pitch != null ? <p className={styles.pitch}>{pitch}</p> : null}
        </div>
        <div ref={formAreaRef} className={styles.formArea}>
          {form}
        </div>
      </div>
      <p className={styles.printLine}>
        Subscribe at <span className={styles.printUrl}>{printUrl}</span>
      </p>
    </div>
  )

  const cardPreset = isStraddle ? 'royal' : field
  const body =
    cardPreset != null ? (
      <Ground
        kind="field"
        preset={cardPreset}
        render={<div />}
        className={grained ? `${styles.card} ${styles.grainedCard}` : styles.card}
      >
        {content}
      </Ground>
    ) : (
      content
    )

  return useRender({
    defaultTagName: resolvedKind === 'inline' ? 'div' : 'section',
    render,
    ref: setRootRef,
    props: mergeProps<'section'>(
      {
        ...scope,
        // A section is named by its heading; the inline form's `div` is generic, so it takes no name.
        'aria-labelledby': resolvedKind === 'inline' && render == null ? undefined : headingId,
        className: newsletter({
          kind: resolvedKind,
          grained: isStraddle && grained === true,
          reading: isStraddle && reading === true,
          primary,
          secondary,
          className,
        }),
        children: body,
      } as React.ComponentProps<'section'>,
      rest,
    ),
  })
}
