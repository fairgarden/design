'use client'

import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../Ground'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes, type PageGroundPreset } from '../../utils/scope'
import { StatusGlyph, statusLabels, statusScales, type Status } from '../../utils/StatusGlyph'
import styles from './avatar.module.css'
import groupStyles from './avatar-group.module.css'

/*
 * Avatar (§10.12): a person or organization beside a byline, comment,
 * member list or account menu.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: avatar.module.css (`avatar`, `avatarStatus`);
 *   avatar-group.module.css (`avatarGroup`, the composed group).
 * - Axes: `size` → xs | sm | md | lg | xl (24 / 32 / 40 / 64 / 128 px; each
 *   sets --avatar-size, the ring weight and the initials size) [D155];
 *   `primary`, `secondary` → scales module classes (`secondary` unused).
 * - Compound variants: none.
 * - Defaults: size md; color axes: none.
 * - Color fallback: inherits the scope. The status part: the status scale of
 *   its `status` [D129].
 * - States: the Fallback renders while the Image is loading or failed (Base
 *   UI's loading status; the Root sets no attribute) → the initials face; as
 *   a link or menu trigger, the element's `:hover` → a ring up to 40 px
 *   steps --role-rule → --primary12 at the same weight, unchanged from
 *   64 px [D181], and `:focus-visible` → ring outside the frame.
 * - Parts: base (frame and ring), image, fallback (initials), status (with
 *   `statusGlyph`); Avatar Group base, item, more.
 * - Scope: `fallback` and the `status` disc are nested face scopes (the
 *   white preset; light islands on dark grounds); otherwise none.
 * - Container: none; inherits its context.
 */
export const avatar = cva(styles.base, {
  variants: {
    size: {
      xs: styles.xs,
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
      xl: styles.xl,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    size: 'md',
  },
})

/** The status disc's class. */
export const avatarStatus = cva(styles.status)

/** The group's classes: its size publishes the overlap. */
export const avatarGroup = cva(groupStyles.base, {
  variants: {
    size: {
      xs: groupStyles.xs,
      sm: groupStyles.sm,
      md: groupStyles.md,
      lg: groupStyles.lg,
      xl: groupStyles.xl,
    },
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    size: 'md',
  },
})

type AvatarVariants = VariantProps<typeof avatar>
export type AvatarSize = NonNullable<AvatarVariants['size']>

/** The initials face and status disc: nested white faces that read the same on every ground. */
const FACE_PRESET: PageGroundPreset = 'white'

/** A group's size, inherited by its avatars. */
const AvatarSizeContext = React.createContext<AvatarSize | undefined>(undefined)

/** Props for Avatar: Base UI Avatar Root props plus the size and color axes. */
export type AvatarProps = BaseAvatar.Root.Props & {
  /**
   * `xs` 24, `sm` 32, `md` 40 (default), `lg` 64, `xl` 128 px. Up to 40 px
   * the ring is `--border-size-1` `--role-rule`; from 64 px it is
   * `--border-size-2` `--primary12`. Sizes are fixed at every width.
   */
  size?: AvatarVariants['size']
  /**
   * Primary Radix scale: the ring. Never defaulted; omitted, it inherits
   * the scope [D133].
   */
  primary?: AvatarVariants['primary']
  /** Secondary Radix scale, accepted for the shared contract; no part uses it. */
  secondary?: AvatarVariants['secondary']
}

/**
 * The circular frame and its ring. Compose `AvatarImage` (a photo or a
 * seal), `AvatarFallback` (1–2 initials, shown until the image loads or if
 * it fails) and an optional `AvatarStatus`. Give the image alt text with the
 * name, or empty alt when the name is adjacent. As a link or menu trigger,
 * wrap it (or pass `render`): on hover a ring up to 40 px steps to
 * `--primary12` at the same weight.
 */
export function Avatar(props: AvatarProps) {
  const { size, primary, secondary, className, ...rest } = props
  const groupSize = React.useContext(AvatarSizeContext)
  const scope = useScopeAttributes()
  return (
    <BaseAvatar.Root
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        avatar({ size: size ?? groupSize, primary, secondary, className: extra })
      )}
    />
  )
}

/** Props for AvatarImage: Base UI Avatar Image props. */
export type AvatarImageProps = BaseAvatar.Image.Props

/** The photo or seal, cropped to the circle. Prints in grayscale. */
export function AvatarImage(props: AvatarImageProps) {
  const { className, ...rest } = props
  return (
    <BaseAvatar.Image
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.image, extra))}
    />
  )
}

/** Props for AvatarFallback: Base UI Avatar Fallback props. */
export type AvatarFallbackProps = BaseAvatar.Fallback.Props

/**
 * The initials face: a nested white face (`--primary1`) with 1–2 caps
 * initials in the UI sans at weight 700 and `--primary12`, the same on every
 * ground. Never color-code initials backgrounds.
 */
export function AvatarFallback(props: AvatarFallbackProps) {
  const { className, children, delay, ...rest } = props
  return (
    <Ground
      kind="face"
      preset={FACE_PRESET}
      render={<BaseAvatar.Fallback delay={delay} {...rest} />}
      className={typeof className === 'string' ? cx(styles.fallback, className) : styles.fallback}
    >
      {children}
    </Ground>
  )
}

/** Props for AvatarStatus: `span` props, the status and its word. */
export type AvatarStatusProps = Omit<React.ComponentPropsWithRef<'span'>, 'children'> & {
  /** The presence or state: info, success, warning or danger (§1.5.4). */
  status: Status
  /**
   * The state in words, e.g. "Away": the glyph's accessible name. Show the
   * word beside the avatar too; presence is never a color dot alone.
   */
  label?: string
}

/**
 * The status glyph (§1.5.4, with its inner mark) on its own white disc at
 * the frame's bottom end, `--size-px-3`, in `--role-status` of its status
 * scale.
 */
export function AvatarStatus(props: AvatarStatusProps) {
  const { status, label, className, ...rest } = props
  return (
    <Ground
      {...(rest as React.HTMLAttributes<HTMLElement>)}
      kind="face"
      preset={FACE_PRESET}
      secondary={statusScales[status]}
      render={<span />}
      className={avatarStatus({ className })}
    >
      <StatusGlyph
        status={status}
        label={label ?? statusLabels[status]}
        className={styles.statusGlyph}
      />
    </Ground>
  )
}

/** Props for AvatarGroup: `div` props, `render`, the size, the total and the color axes. */
export type AvatarGroupProps = useRender.ComponentProps<'div'> & {
  /** Size of every avatar in the group. Default `md`. */
  size?: AvatarVariants['size']
  /**
   * How many people the group stands for, when more exist than the avatars
   * passed. Default: the number of avatars.
   */
  total?: number
  /** Primary Radix scale for the group's avatars. Never defaulted. */
  primary?: AvatarVariants['primary']
  /** Secondary Radix scale, accepted for the shared contract; no part uses it. */
  secondary?: AvatarVariants['secondary']
  /** Accessible name for the "+N" avatar; receives N. Default "N more". */
  moreLabel?: (count: number) => string
}

const defaultMoreLabel = (count: number) => `${count} more`

/**
 * Overlapping avatars (−25%) separated by a `--size-px-1` ring in
 * `--role-halo`, ending in a "+N" initials avatar: 3 avatars at base, up to
 * 5 from 1024 px.
 */
export function AvatarGroup(props: AvatarGroupProps) {
  const {
    render,
    ref,
    className,
    size,
    total,
    primary,
    secondary,
    moreLabel = defaultMoreLabel,
    children,
    ...rest
  } = props
  const scope = useScopeAttributes()
  const resolvedSize: AvatarSize = size ?? 'md'

  const avatars = React.Children.toArray(children).filter(React.isValidElement)
  const shown = avatars.slice(0, 5)
  const count = Math.max(total ?? avatars.length, avatars.length)
  const moreBase = count - Math.min(3, shown.length)
  const moreWide = count - shown.length

  const more = (n: number, visibility?: string) => (
    <span key={`more-${visibility ?? 'all'}`} className={cx(groupStyles.item, visibility)}>
      <Avatar size={resolvedSize} role="img" aria-label={moreLabel(n)} className={groupStyles.more}>
        <AvatarFallback aria-hidden="true">+{n}</AvatarFallback>
      </Avatar>
    </span>
  )

  const content = (
    <AvatarSizeContext.Provider value={resolvedSize}>
      {shown.map((child, index) => (
        <span
          key={child.key ?? index}
          className={index >= 3 ? cx(groupStyles.item, groupStyles.extra) : groupStyles.item}
        >
          {child}
        </span>
      ))}
      {moreBase > 0 && moreBase === moreWide ? more(moreBase) : null}
      {moreBase > 0 && moreBase !== moreWide ? more(moreBase, groupStyles.moreBase) : null}
      {moreWide > 0 && moreBase !== moreWide ? more(moreWide, groupStyles.moreWide) : null}
    </AvatarSizeContext.Provider>
  )

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scope,
        role: 'group',
        className: avatarGroup({ size: resolvedSize, primary, secondary, className }),
        children: content,
      },
      rest
    ),
  })
}

