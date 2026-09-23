'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, type IconName } from '../../foundations/icon'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './tag.module.css'

/*
 * Tag (§10.11): the topic tag, taxonomy with no container.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: tag.module.css; CVA function `tag`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: none; color axes: none.
 * - Color fallback: the taxonomy scale, passed as `secondary`; omitted, it
 *   inherits the scope.
 * - States (linked tags only): `:hover` → the bare-text underline on the
 *   label, --role-accent at --border-size-2, offset --size-px-1 [D181];
 *   `:focus-visible` → ring around icon and label.
 * - Parts: base, icon, label.
 * - Scope: none. Container: none; inherits its context.
 */
export const tag = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type TagVariants = VariantProps<typeof tag>

/** Props for Tag: `span` props, `render`, the link target, the icon and the color axes. */
export type TagProps = useRender.ComponentProps<'span'> & {
  /** Makes the tag a link to its topic; it renders an `<a>` and gains the link states. */
  href?: string
  /**
   * The topic's subject symbol, Material Symbols Rounded at the tag tier
   * (20 px, FILL 0): an inventory name, or a registered subject symbol's
   * SVG element, which the tag sizes and fills in `currentColor` [D166].
   * It carries the tag's only color, `--role-accent`.
   */
  icon?: IconName | React.ReactElement
  /**
   * Primary Radix scale: the label ink and focus ring. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: TagVariants['primary']
  /**
   * Secondary Radix scale: the taxonomy scale, which colors the icon
   * through `--role-accent`. Omitted, it inherits the scope.
   */
  secondary?: TagVariants['secondary']
}

/**
 * A topic tag: an icon plus a caps label (`type-label` at weight 700,
 * authored in sentence case; topic tags keep caps [D160]), with no
 * container. Color sits on the icon only, never on the small label text.
 * Pass `href` to link it to its topic.
 */
export function Tag(props: TagProps) {
  const { render, ref, className, href, icon, primary, secondary, children, ...rest } = props
  const scope = useScopeAttributes()

  const glyph =
    icon == null ? null : typeof icon === 'string' ? (
      <Icon name={icon} size="tag" className={styles.icon} />
    ) : (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    )

  return useRender({
    defaultTagName: href == null ? 'span' : 'a',
    render,
    ref,
    props: mergeProps<'span'>(
      {
        ...scope,
        ...(href == null ? null : ({ href } as React.ComponentProps<'span'>)),
        className: tag({ primary, secondary, className }),
        children: (
          <>
            {glyph}
            <span className={styles.label}>{children}</span>
          </>
        ),
      },
      rest
    ),
  })
}
