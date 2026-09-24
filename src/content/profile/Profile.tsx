'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Avatar, type AvatarProps, type AvatarSize } from '../../feedback/avatar'
import { Link, type LinkProps } from '../../actions/link'
import { cx, resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './profile.module.css'

/*
 * Profile & Team (§12.15): people and organizations (authors, staff,
 * partner groups, speakers). Avatar (§10.12) holds byline, author and
 * bio portraits; team photos are plain `img` figures. Species use §12.2 and
 * testimonials §12.8.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: profile.module.css; CVA function `profile`.
 * - Axes: `kind` → byline | author | bio | team → `kindByline`, `author`,
 *   `kindBio`, `team` (axis-prefixed: `byline` and `bio` are also parts);
 *   `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: none (`kind` is required); color axes: none.
 * - Color fallback: inherits the scope, and passes both props to the Avatar.
 * - States: Avatar swaps Image and Fallback by its loading status, with no
 *   styling attribute; the name and social links are Links (§9.3), which own
 *   their hover and press; `member:has(nameLink:focus-visible)` (or the
 *   root's) → the ring around the item.
 * - Parts: base, portrait (Avatar Root: the module passes the §10.12 size
 *   per kind: byline sm, author md, bio lg stepping to the xl diameter from
 *   768 px of container), portraitImage / initials (AvatarImage /
 *   AvatarFallback, composed by the consumer), teamPhoto, details (the bio
 *   row's text column), name, nameLink, role, bio, links, byline (the
 *   byline kind's root), date, teamList (the team grid; `team` is the kind's
 *   class) and member.
 * - Scope: none in this module; the initials face is the Avatar's own.
 * - Container: `base` is the inline-size container `profile`; the team list
 *   and the bio row query it. Baseline without support: team cells in a
 *   grid auto-fit with minmax tracks at the 152 px compact minimum, capped
 *   at 5 (1-up at --xs-n-below); the bio row as two columns that wrap
 *   (flex-wrap) to a stack when portrait and text no longer fit; byline and
 *   author block need no reflow. Thresholds (§5.10.2): below 360 the bio
 *   row stacks and team 1-up; 2-up from 360; 4-up and the xl portrait from
 *   768; up to 5-up from 1024 [D163].
 */
export const profile = cva(styles.base, {
  variants: {
    kind: {
      byline: styles.kindByline,
      author: styles.author,
      bio: styles.kindBio,
      team: styles.team,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type ProfileVariants = VariantProps<typeof profile>

/** The four profile builds (§12.15). */
export type ProfileKind = 'byline' | 'author' | 'bio' | 'team'

interface ProfileContextValue {
  kind: ProfileKind
  primary: PrimaryScale | undefined
  secondary: RadixScale | undefined
}

const ProfileContext = React.createContext<ProfileContextValue>({
  kind: 'author',
  primary: undefined,
  secondary: undefined,
})
ProfileContext.displayName = 'ProfileContext'

/** The §10.12 Avatar size the module passes per kind (§12.15 Tokens). */
const portraitSizes: Record<Exclude<ProfileKind, 'team'>, AvatarSize> = {
  byline: 'sm',
  author: 'md',
  bio: 'lg',
}

/** Props for Profile: `div` props, `render`, the kind and the color axes. */
export type ProfileProps = useRender.ComponentProps<'div'> & {
  /**
   * Required. `byline`: inline, a 32 px portrait, "By Name" and the date
   * joined by "·". `author`: the end-of-article block, portrait → serif
   * name → description. `bio`: portrait at the start (64 px, 128 px from
   * 768 px of container) beside the heading and body, even on phones.
   * `team`: a grid of square photos with names and roles.
   */
  kind: ProfileKind
  /**
   * Primary Radix scale: rings, frames, initials and text. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: ProfileVariants['primary']
  /**
   * Secondary Radix scale: only the name-link and social-link underlines
   * (`--role-accent`). Never defaulted.
   */
  secondary?: ProfileVariants['secondary']
}

/**
 * The profile module. A byline holds `ProfilePortrait`, `ProfileName` and
 * `ProfileDate`; an author block `ProfilePortrait`, `ProfileName`,
 * `ProfileBio`; a bio row `ProfilePortrait` and `ProfileDetails` (name,
 * role, bio, links); a team `ProfileTeam` of `ProfileMember`s, each with a
 * `ProfileTeamPhoto`, `ProfileName` and `ProfileRole`. Use real portraits
 * or initials; never overlay names on photos, never dim former members.
 */
export function Profile(props: ProfileProps) {
  const { render, ref, className, kind, primary, secondary, ...rest } = props
  const scope = useScopeAttributes()
  const context = React.useMemo<ProfileContextValue>(
    () => ({ kind, primary: primary ?? undefined, secondary: secondary ?? undefined }),
    [kind, primary, secondary]
  )
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scope,
        className: profile({ kind, primary, secondary, className }),
      },
      rest
    ),
  })
  return <ProfileContext.Provider value={context}>{element}</ProfileContext.Provider>
}

/** Props for ProfilePortrait: Avatar props; `size` follows the kind unless given. */
export type ProfilePortraitProps = AvatarProps

/**
 * The portrait: an Avatar sized by the kind (byline 32 px, author 40 px,
 * bio 64 px stepping to 128 px from 768 px of container), with its ring per
 * §10.12, taking the module's `primary` and `secondary` unless given its
 * own. Compose `AvatarImage` (empty alt where the name is adjacent) and
 * `AvatarFallback` (1–2 initials) inside; the fallback keeps the spacing.
 */
export function ProfilePortrait(props: ProfilePortraitProps) {
  const { size, primary, secondary, className, ...rest } = props
  const context = React.useContext(ProfileContext)
  const resolvedSize = size ?? (context.kind === 'team' ? 'lg' : portraitSizes[context.kind])
  return (
    <Avatar
      {...rest}
      size={resolvedSize}
      primary={primary ?? context.primary}
      secondary={secondary ?? context.secondary}
      className={resolveClassName(className, (extra) => cx(styles.portrait, extra))}
    />
  )
}

/** Props for ProfileTeamPhoto: `img` props and `render`. */
export type ProfileTeamPhotoProps = useRender.ComponentProps<'img'>

/**
 * A team member's photo: a plain `img`, square at the cell's full width,
 * `--radius-2-25`, framed in a `--border-size-1` `--role-hairline` line.
 * Give it empty alt when the name follows.
 */
export function ProfileTeamPhoto(props: ProfileTeamPhotoProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'img',
    render,
    ref,
    props: mergeProps<'img'>({ className: cx(styles.teamPhoto, className) }, rest),
  })
}

/** Props for ProfileDetails: `div` props and `render`. */
export type ProfileDetailsProps = useRender.ComponentProps<'div'>

/** The bio row's text column beside the portrait: name, role, bio and links. */
export function ProfileDetails(props: ProfileDetailsProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.details, className) }, rest),
  })
}

/** Props for ProfileName: heading props and `render` (default `<h3>`; `<span>` in a byline). */
export type ProfileNameProps = useRender.ComponentProps<'h3'>

/**
 * The name in `--primary12`: `type-itemhead` for the author block, bio row
 * and team, `type-body-ui` at `--font-weight-6` in a byline ("By Name").
 * Renders `<h3>`, or `<span>` in a byline. Wrap a `ProfileNameLink` inside
 * to link the profile.
 */
export function ProfileName(props: ProfileNameProps) {
  const { render, ref, className, ...rest } = props
  const { kind } = React.useContext(ProfileContext)
  const isByline = kind === 'byline'
  return useRender({
    defaultTagName: isByline ? 'span' : 'h3',
    render,
    ref,
    props: mergeProps<'h3'>(
      { className: cx(isByline ? styles.nameUi : styles.name, className) },
      rest
    ),
  })
}

/** Props for ProfileNameLink: Link props except `kind`, which is always `title`. */
export type ProfileNameLinkProps = Omit<LinkProps, 'kind'>

/**
 * The profile's one link, inside `ProfileName`: a §9.3 title Link whose hit
 * area stretches over the member (or the whole profile). Hover, focus and
 * press underline the name; the item draws the focus ring.
 */
export function ProfileNameLink(props: ProfileNameLinkProps) {
  const { className, ...rest } = props
  return <Link {...rest} kind="title" className={cx(styles.nameLink, className)} />
}

/** Props for ProfileRole: paragraph props and `render`. */
export type ProfileRoleProps = useRender.ComponentProps<'p'>

/**
 * Role or affiliation: `type-label` caps in `--primary12`. Former members
 * say so in words ("Former board chair"); never dim them.
 */
export function ProfileRole(props: ProfileRoleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.role, className) }, rest),
  })
}

/** Props for ProfileBio: `div` props and `render`. */
export type ProfileBioProps = useRender.ComponentProps<'div'>

/** A short bio or description, 3–5 lines of `type-body-ui` in `--primary12`; prints in full. */
export function ProfileBio(props: ProfileBioProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.bio, className) }, rest),
  })
}

/** Props for ProfileLinks: list props and `render`. */
export type ProfileLinksProps = useRender.ComponentProps<'ul'>

/**
 * Social and contact links, a `ul` of `li > Link`: text links with the
 * `--role-accent` underline, or inline-tier icons. They sit above a
 * stretched name link as their own tab stops. In print, write handles in
 * text; icon-only links are omitted.
 */
export function ProfileLinks(props: ProfileLinksProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.links, className) }, rest),
  })
}

/** Props for ProfileDate: `time` props and `render`. */
export type ProfileDateProps = useRender.ComponentProps<'time'>

/** The byline date, after a "·" separator: `type-caption` in `--primary12`. Pass `dateTime`. */
export function ProfileDate(props: ProfileDateProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'time',
    render,
    ref,
    props: mergeProps<'time'>({ className: cx(styles.date, className) }, rest),
  })
}

/** Props for ProfileTeam: list props and `render`. */
export type ProfileTeamProps = useRender.ComponentProps<'ul'>

/**
 * The team grid: 1-up below 360 px of container, 2-up from 360, 4-up from
 * 768, up to 5-up from 1024 (auto-fit at 152 px without container-query
 * support). Prints 3-up.
 */
export function ProfileTeam(props: ProfileTeamProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.teamList, className) }, rest),
  })
}

/** Props for ProfileMember: list-item props and `render`. */
export type ProfileMemberProps = useRender.ComponentProps<'li'>

/** One team member: photo → name → role. A `ProfileNameLink` links the whole cell. */
export function ProfileMember(props: ProfileMemberProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>({ className: cx(styles.member, className) }, rest),
  })
}

