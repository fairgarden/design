'use client'

import * as React from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { Field as BaseField } from '@base-ui/react/field'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../../actions/button'
import { dangerScale, useFieldInvalid } from '../field'
import { Ground } from '../../foundations/ground'
import { Icon, type IconName } from '../../foundations/icon'
import { StatusGlyph } from '../../utils/StatusGlyph'
import { assignRef } from '../../utils/assignRef'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './input.module.css'

/*
 * Input (§10.3): single-line text, email, password, telephone and URL, plus
 * multi-line text (the textarea). The box is the §10.1 field box.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: input.module.css; CVA function `input` (the textarea shares it).
 * - Axes: `variant` → outline (the field box), underline (a lone bottom
 *   rule); `labelInside` → labelInside; `multiline` → multiline; `plate` →
 *   plate; `butted` → end → buttedEnd; `primary`, `secondary` → scales.
 * - Compound variants: none. Excluded in the types: underline with
 *   labelInside, plate or butted; multiline with labelInside or butted.
 * - Defaults: variant outline, labelInside false, multiline false, plate
 *   false, no butted; color axes none.
 * - Color fallback: inherits the scope; while the Field is invalid its
 *   danger scale arrives as `secondary` (§10.2) [D129]. The action cell's
 *   Button takes the scope's action scale through its `solid` class.
 * - States: `:hover` (not disabled) → edge --role-rule → --primary12 at the
 *   same weight, the underline rule included [D140, D181]; `data-focused` →
 *   the ring on any focus [D90]; `data-invalid` → the --border-size-2 error
 *   edge; `data-disabled` → dotted edge, --role-muted; `readonly` → box
 *   removed, bottom rule kept. Read on the control from the box.
 * - Parts: base, icon, affix, control, label, count, actionSlot; `edge` /
 *   `edgeLine` draw the dotted disabled edge; `ruled` prints blank lines.
 * - Scope: `plate` → the box is a nested `white` Ground (a light island on
 *   fixed grounds); otherwise none.
 * - Container: none of its own. Inside a Form it reads the `form`
 *   container: the butted cell is icon-only below 360 px (§5.10.2) [D163].
 */
export const input = cva(styles.base, {
  variants: {
    variant: {
      outline: styles.outline,
      underline: styles.underline,
    },
    labelInside: {
      true: styles.labelInside,
    },
    multiline: {
      true: styles.multiline,
    },
    plate: {
      true: styles.plate,
    },
    butted: {
      end: styles.buttedEnd,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'outline',
    labelInside: false,
    multiline: false,
    plate: false,
  },
})

/**
 * The module's part classes, for composed components that build a field box
 * around another Base UI control (Search's Autocomplete input) and leave the
 * box's parts to this module (§1.11.1).
 */
export const inputParts = {
  control: styles.control,
  icon: styles.icon,
  affix: styles.affix,
  actionSlot: styles.actionSlot,
  actionIcon: styles.actionIcon,
  actionText: styles.actionText,
  edge: styles.edge,
  edgeLine: styles.edgeLine,
} as const

type InputVariants = VariantProps<typeof input>

/** The butted action cell (§10.3): a solid Button joined to the box's end. */
export interface InputAction {
  /**
   * The action's accessible name, and its visible `type-button` label from
   * `--md-n-above` when `labelled`. Title case, no tracking [D160].
   */
  label: string
  /**
   * Shows `label` in the cell from `--md-n-above` (with `--size-px-5`
   * padding). It stays the icon-only 64 × 48 px cell at base, below
   * `--xs-n-below` and below 360 px of Form width. Default `false`.
   */
  labelled?: boolean
  /** Busy: the cell is inert and reads `busyLabel`; an icon-only cell shows "…" [D84]. */
  busy?: boolean
  /** The "-ing…" wording while busy, e.g. "Sending…". Default "Sending…". */
  busyLabel?: string
  /** Default `submit`. */
  type?: 'submit' | 'button'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

type ControlProps = Omit<BaseInput.Props, 'className' | 'style' | 'render' | 'prefix'>

interface InputOwnProps {
  /** Class names for the box (the root), added after the module's own. */
  className?: string
  /** Inline style for the box: set its width to the expected answer (postcode `8ch`). */
  style?: React.CSSProperties
  /**
   * Primary Radix scale: box edge, value, placeholder, icon and focus ring.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: InputVariants['primary']
  /**
   * Secondary Radix scale. Unused at rest; while the Field is invalid it is
   * the danger scale (the error edge).
   */
  secondary?: InputVariants['secondary']
  /** A leading icon: Material Symbols Rounded, inline tier (§6.10). */
  icon?: IconName
  /** A prefix unit inside the box, in --role-muted ("$"). */
  prefix?: React.ReactNode
  /** A suffix unit inside the box, in --role-muted ("USD"). Never the unit only in the placeholder. */
  suffix?: React.ReactNode
}

interface SingleLineProps {
  /** `true` renders the textarea. Default `false`. */
  multiline?: false
  rows?: never
  limit?: never
  /**
   * Password fields: adds a "Show" / "Hide" text toggle, never an eye icon
   * alone (§10.3).
   */
  reveal?: boolean
  /** The toggle's two labels. Default `['Show', 'Hide']`. */
  revealLabels?: readonly [show: string, hide: string]
}

interface MultilineProps {
  /** The textarea: at least 3 lines, vertical resize only. */
  multiline: true
  /** Visible lines. Default 3 (the minimum). */
  rows?: number
  /**
   * Shows a `type-data` count against this soft limit; over it, the count
   * turns --primary12 with the danger ◆. Validate the limit in the Field.
   */
  limit?: number
  reveal?: never
  revealLabels?: never
}

type LabelInsideProps =
  | {
      /** The `--ds-size-control-xl` box with the label inside. Default `false`. */
      labelInside: true
      /** The label drawn inside the box, title case [D160]. Required with `labelInside`. */
      label: React.ReactNode
    }
  | { labelInside?: false; label?: never }

type ButtedProps =
  | {
      /** Joins the action cell at the box's end: --ds-radius-none at the seam. */
      butted: 'end'
      /** The butted action cell; one-field forms only. */
      action: InputAction
    }
  | { butted?: never; action?: never }

type NotLabelInside = { labelInside?: false; label?: never }
type NotButted = { butted?: never; action?: never }

type OutlineSingleProps = {
  /** `outline` (default) is the §10.1 field box; `underline` a lone bottom rule. */
  variant?: 'outline'
  /** The box face becomes a nested `white` scope; patterned grounds only (§10.1). */
  plate?: boolean
} & SingleLineProps &
  LabelInsideProps &
  ButtedProps

type OutlineMultilineProps = {
  variant?: 'outline'
  plate?: boolean
} & MultilineProps &
  NotLabelInside &
  NotButted

type UnderlineProps = {
  /** A lone `--border-size-1` bottom rule: dense settings rows and printable blanks. */
  variant: 'underline'
  plate?: false
} & (SingleLineProps | MultilineProps) &
  NotLabelInside &
  NotButted

/**
 * Props for Input: Base UI Input props (for the control) plus the variant,
 * slot and color props. `className` and `style` go to the box.
 */
export type InputProps = ControlProps &
  InputOwnProps &
  (OutlineSingleProps | OutlineMultilineProps | UnderlineProps)

/** The loose shape the component reads; the union above does the excluding. */
type InputPropsLoose = ControlProps &
  InputOwnProps & {
    variant?: 'outline' | 'underline'
    plate?: boolean
    multiline?: boolean
    rows?: number
    limit?: number
    reveal?: boolean
    revealLabels?: readonly [string, string]
    labelInside?: boolean
    label?: React.ReactNode
    butted?: 'end'
    action?: InputAction
  }

/**
 * A text field on Base UI's Input (Field.Control), inside a `Field`. The
 * placeholder is never the label; end it with "…". A plate belongs only on
 * a patterned ground; everywhere else the box is open.
 */
export function Input(props: InputProps) {
  const {
    variant,
    plate,
    multiline,
    rows = 3,
    limit,
    reveal,
    revealLabels = ['Show', 'Hide'],
    labelInside,
    label,
    butted,
    action,
    icon,
    prefix,
    suffix,
    primary,
    secondary,
    className,
    style,
    type,
    placeholder,
    readOnly,
    value,
    defaultValue,
    onValueChange,
    ref,
    ...controlProps
  } = props as InputPropsLoose

  const scope = useScopeAttributes()
  const invalid = useFieldInvalid()
  const resolvedSecondary = invalid ? dangerScale : secondary

  const controlRef = React.useRef<HTMLElement | null>(null)
  const setControlRef = React.useCallback(
    (node: HTMLElement | null) => {
      controlRef.current = node
      assignRef(ref as React.Ref<HTMLElement> | undefined, node)
    },
    [ref],
  )

  // Count against a soft limit (textarea only).
  const [length, setLength] = React.useState(() => String(value ?? defaultValue ?? '').length)
  React.useEffect(() => {
    if (value !== undefined) setLength(String(value).length)
  }, [value])
  const handleValueChange: ControlProps['onValueChange'] = (next, details) => {
    if (limit !== undefined) setLength(next.length)
    onValueChange?.(next, details)
  }

  // Password reveal: a text toggle, never an eye icon alone.
  const [revealed, setRevealed] = React.useState(false)
  const canReveal = !multiline && reveal === true && type === 'password'
  const resolvedType = canReveal && revealed ? 'text' : type

  const classes = input({
    variant,
    labelInside,
    multiline,
    plate,
    butted,
    // A plate's scales go to its Ground, so the white scope can resolve them.
    primary: plate ? undefined : primary,
    secondary: plate ? undefined : resolvedSecondary,
    className,
  })

  // A press on the box's padding focuses the control, as a click on a label would.
  const focusControl = (event: React.PointerEvent<HTMLElement>) => {
    if (event.target === event.currentTarget && controlRef.current) {
      event.preventDefault()
      controlRef.current.focus()
    }
  }

  const over = limit !== undefined && length > limit

  const content = (
    <>
      {labelInside ? <BaseField.Label className={styles.label}>{label}</BaseField.Label> : null}
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      {prefix != null ? <span className={styles.affix}>{prefix}</span> : null}
      <BaseInput
        {...controlProps}
        ref={setControlRef}
        type={multiline ? undefined : resolvedType}
        readOnly={readOnly}
        placeholder={readOnly ? undefined : placeholder}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={styles.control}
        render={multiline ? <textarea rows={rows} /> : undefined}
      />
      {suffix != null ? <span className={styles.affix}>{suffix}</span> : null}
      {canReveal ? (
        <Button
          variant="text"
          size="sm"
          type="button"
          disabled={controlProps.disabled}
          onClick={() => setRevealed((shown) => !shown)}
        >
          {revealed ? revealLabels[1] : revealLabels[0]}
        </Button>
      ) : null}
      {multiline && limit !== undefined ? (
        <CountPart length={length} limit={limit} over={over} />
      ) : null}
      {multiline ? (
        <span className={styles.ruled} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : null}
      <svg className={styles.edge} aria-hidden="true" focusable="false">
        {variant === 'underline' ? (
          <line className={styles.edgeLine} x1="0" y1="100%" x2="100%" y2="100%" />
        ) : (
          <rect className={styles.edgeLine} width="100%" height="100%" />
        )}
      </svg>
      {butted === 'end' && action ? <ActionCell action={action} /> : null}
    </>
  )

  if (plate) {
    return (
      <Ground
        preset="white"
        kind="face"
        primary={primary ?? undefined}
        secondary={resolvedSecondary ?? undefined}
        render={<div />}
        className={classes}
        style={style}
        onPointerDown={focusControl}
      >
        {content}
      </Ground>
    )
  }

  return (
    <div {...scope} className={classes} style={style} onPointerDown={focusControl}>
      {content}
    </div>
  )
}

/** The count, and over its limit the danger ◆ with the danger scale on the part. */
function CountPart({ length, limit, over }: { length: number; limit: number; over: boolean }) {
  const scope = useScopeAttributes()
  const className = over
    ? [styles.count, styles.countOver, secondaryScaleVariants[dangerScale]].join(' ')
    : styles.count

  return (
    <span className={className} {...(over ? scope : null)}>
      <StatusGlyph status="danger" className={styles.countGlyph} />
      {length}/{limit}
    </span>
  )
}

/**
 * The butted cell: the icon-only 64 × 48 px `solid` Button with
 * `arrow_forward`, and a labelled `lg` twin that the module shows from
 * `--md-n-above` when `labelled`.
 */
function ActionCell({ action }: { action: InputAction }) {
  const {
    label,
    labelled = false,
    busy = false,
    busyLabel = 'Sending…',
    type = 'submit',
    onClick,
    disabled,
  } = action
  const name = busy ? busyLabel : label
  const shared = {
    type,
    onClick,
    disabled,
    'aria-busy': busy || undefined,
  } as const

  return (
    <span className={styles.actionSlot}>
      <Button
        {...shared}
        variant="solid"
        butted="start"
        iconOnly
        icon={busy ? 'more_horiz' : 'arrow_forward'}
        className={styles.actionIcon}
      >
        {name}
      </Button>
      {labelled ? (
        <Button {...shared} variant="solid" butted="start" size="lg" className={styles.actionText}>
          {name}
        </Button>
      ) : null}
    </span>
  )
}
