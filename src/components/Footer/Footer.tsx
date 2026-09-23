'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Accordion, AccordionItem } from '../Accordion'
import { Ground, type BandPreset } from '../Ground'
import { Icon, type IconName } from '../Icon'
import { Link } from '../Link'
import type { SitemapLink, SitemapSection } from '../../utils/navigation'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './footer.module.css'

/** The shared navigation data (utils/navigation), re-exported where it first lived. */
export type { SitemapLink, SitemapSection } from '../../utils/navigation'

/*
 * Footer (§11.13): the page's heaviest band and closing summary: action
 * blocks, the sitemap (generated from the same data as the navigation
 * panels, the top-level sections as its group headings [D187]: the shared
 * `SitemapSection` of utils/navigation), contact,
 * social, the legal row and the colophon. Required on every page; it
 * absorbs everything other systems float (back to top, accessibility
 * settings, chat, feedback).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: footer.module.css; CVA function `footer`.
 * - Axes: `kind` → guide | ruled | minimal → `guide`, `ruled`, `minimal`
 *   (field guide, ruled grid, minimal); `signoff` → `signoff` (the cropped
 *   sign-off wordmark); `newsletterColumn` → `newsletterColumn` (sitemap
 *   1–7 / newsletter 8–12; `guide` only) [D187]; `primary`, `secondary` →
 *   scales module classes. `collapsed` is computed, never a prop: above 24
 *   links the groups collapse into an Accordion at base [D174].
 * - Compound variants: none.
 * - Defaults: kind guide, signoff false, newsletterColumn false; color
 *   axes: none [D133].
 * - Color fallback: inherits the footer's Ground (night: slate × green,
 *   amber action); `primary` and `secondary` override the preset's scales
 *   on that Ground. Block actions are §9.2 Buttons, whose `solid` class
 *   aliases the scope's action scale.
 * - States: the Accordion's `data-open`, `data-panel-open` and clip reveal
 *   live in its module; `aria-current="page"` → the --ds-stroke-3
 *   start-edge bar and weight 700; `:hover` [D181] → sitemap, group,
 *   cell and back-to-top links are §9.3 list links (Link `kind="nav"`
 *   with `list`) and legal links its `muted` ancestor ink, so Link owns
 *   their color-only hover (the underline where --role-link-hover
 *   resolves to --primary12), press and ring; social links take
 *   --role-link-hover only; contact links (underlined at rest) the body
 *   link's hover; `:focus-visible` → the ring. Disabled is never used.
 * - Parts: base, container, blocks, block, blockIcon, blockHeading,
 *   blockBody, blockAction, main, brand, sitemap, sitemapAccordion, groups,
 *   group, groupHeading, chevron, links, link, contact,
 *   contactLink, address, social, socialLink, socialIcon, wordmark (the
 *   sign-off), newsletterColumn, columnRule, backToTop, legal (its top
 *   border is the legalRule), legalLinks, legalLink, copyright, colophon,
 *   cells and cell (ruled grid), linkLine (minimal), imprint (print only).
 *   The top seam is Ground's `--role-seam` (--primary12 on a dark page).
 * - Scope: the root is a `kind="band"` Ground: `night` by default for
 *   `guide`, a page ground for `ruled` and `minimal`; never a field.
 *   Deferred (post-v1): the `soil` footer.
 * - Container: the `blocks` wrapper is the inline-size container
 *   `footer-blocks` (3-up from 944 px) and `sitemap` the container
 *   `footer-sitemap` (groups 2-up from 480 px, 4-up from 600 px, capped at
 *   3-up with `newsletterColumn`); named because they nest in the footer
 *   grid. Baseline: stacked blocks and open groups; viewport fallbacks
 *   3-up blocks at --lg-n-above, groups 2-up at --md-n-above and 4-up at
 *   --lg-n-above. The brand / sitemap split, padding and cap are frame
 *   rules on the viewport (§5.10.2) [D163].
 */
export const footer = cva(styles.base, {
  variants: {
    kind: {
      guide: styles.guide,
      ruled: styles.ruled,
      minimal: styles.minimal,
    },
    signoff: {
      true: styles.signoff,
    },
    newsletterColumn: {
      true: styles.newsletterColumn,
    },
    // Computed: more than 24 sitemap links collapse into an Accordion at base.
    collapsed: {
      true: styles.collapsed,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'guide',
    signoff: false,
    newsletterColumn: false,
  },
})

type FooterVariants = Omit<VariantProps<typeof footer>, 'collapsed'>

/** One contact item: middle-dot separated in the contact line. */
export interface FooterContactItem {
  /** The caps label on the ruled grid's contact rows ("Email"). */
  label?: string
  /** The text: an address, a number, an email. */
  value: string
  /** A `mailto:`, `tel:` or page link, underlined at rest. */
  href?: string
}

/** One social link: an outline icon (20 px, custom SVG in `currentColor`) or a text link. */
export interface FooterSocialLink {
  label: string
  href: string
  icon?: React.ReactNode
}

/** One legal link. */
export interface FooterLegalLink {
  label: string
  href: string
  current?: boolean
}

/** Links from the page to its in-flow "Back to top" target (the skip-link target). */
export interface FooterBackToTop {
  /** The target, e.g. "#main". Focus moves there. */
  href: string
  /** Default "Back to top". */
  label?: string
}

type HeadingLevel = 2 | 3

interface FooterCommonProps extends Omit<React.ComponentPropsWithRef<'footer'>, 'children'> {
  /**
   * The footer's band: `night` (default for `guide`, slate × green, amber
   * action), or a page ground (default `paper` for `ruled` and `minimal`).
   * Never a field [D177].
   */
  preset?: BandPreset
  /** The logo link or wordmark, at the head of the brand column. */
  brand?: React.ReactNode
  /** The action blocks: `FooterBlock`s (icon → heading → body → action). */
  blocks?: React.ReactNode
  /**
   * The sitemap: the shared navigation data (utils/navigation), one group
   * per top-level section, headed by its label and linked to its `href`
   * [D187]. Each group lists the section's `links`; the mega panels' third
   * tier (a link's own `links`) stays in the panels.
   */
  sitemap?: readonly SitemapSection[]
  /** The sitemap's accessible name. Default "Site". */
  sitemapLabel?: string
  /** The postal address: mixed case, unlabeled lines (one per line). */
  address?: React.ReactNode
  /** The contact line, middle-dot separated; links underlined at rest. */
  contact?: readonly FooterContactItem[]
  /** Social links, outline icons or text. */
  social?: readonly FooterSocialLink[]
  /** The legal links, beside the ©. */
  legal?: readonly FooterLegalLink[]
  /** The © line, e.g. "© 2026 FairGarden". */
  copyright?: React.ReactNode
  /**
   * The colophon, `type-small` (dates and versions in `<data>` or `<time>`):
   * "Set in Fraunces, Source Serif 4, Figtree and IBM Plex Mono. Last
   * updated 22 Sept 2026."
   */
  colophon?: React.ReactNode
  /** The organization's name, first in the printed imprint. */
  organization?: React.ReactNode
  /** An in-flow "Back to top" link; never fixed. */
  backToTop?: FooterBackToTop
  /** A straddle Newsletter (`kind="straddle"`) across the footer's top seam. */
  straddle?: React.ReactNode
  /** Heading level of the block and group headings. Default `2`. */
  headingLevel?: HeadingLevel
  /** The locale of the printed "Printed on" date. Default `en-GB`. */
  locale?: string
  /** Primary Radix scale: text, rules, rings. Never defaulted; omitted, it inherits the Ground [D133]. */
  primary?: FooterVariants['primary']
  /** Secondary Radix scale: icons, chevrons, contact underlines, link hover. Never defaulted. */
  secondary?: FooterVariants['secondary']
}

interface FooterGuideProps extends FooterCommonProps {
  /**
   * `guide` (default): the field-guide footer on the night band: action
   * blocks → sitemap → contact → legal → colophon. `ruled`: a page ground
   * opened by the chrome rule, a full-bleed cell grid of caps links and
   * contact rows. `minimal`: a top rule, the logo, one link line, the legal
   * row and the colophon.
   */
  kind?: 'guide'
  /**
   * The sitemap in columns 1–7 and the inline newsletter in 8–12 behind a
   * vertical rule, from `--lg-n-above` [D187]. Default `false`.
   */
  newsletterColumn?: boolean
  /** The inline Newsletter for the newsletter column. */
  newsletter?: React.ReactNode
  /** The newsletter's short URL, printed in the imprint: "Newsletter (example.org/newsletter)". */
  newsletterUrl?: string
  /** A large wordmark in the tint, cropped by the band's bottom edge. Default `false`. */
  signoff?: boolean
  /** The sign-off wordmark's text (decorative; the brand is named elsewhere). */
  wordmark?: string
}

interface FooterPageGroundProps extends FooterCommonProps {
  kind: 'ruled' | 'minimal'
  newsletterColumn?: never
  newsletter?: never
  newsletterUrl?: never
  signoff?: never
  wordmark?: never
}

/** Props for Footer: `footer` props, the kind and its options, the parts' content and the color axes. */
export type FooterProps = FooterGuideProps | FooterPageGroundProps

const ACCORDION_THRESHOLD = 24

const headingTags = { 2: 'h2', 3: 'h3' } as const

/**
 * A sitemap link: the §9.3 list link (`kind="nav"` with `list`), whose hover
 * is color only [D181]; Link draws the external mark.
 */
function SitemapAnchor({ link, className }: { link: SitemapLink; className: string }) {
  return (
    <Link
      kind="nav"
      list
      external={link.external}
      href={link.href}
      className={className}
      aria-current={link.current ? 'page' : undefined}
    >
      {link.label}
    </Link>
  )
}

function LinkList({ section, withIndex }: { section: SitemapSection; withIndex?: boolean }) {
  return (
    <ul className={styles.links}>
      {withIndex && section.href ? (
        <li>
          <Link kind="nav" list href={section.href} className={styles.link}>
            {section.label}
            <Icon name="chevron_right" className={styles.chevron} />
          </Link>
        </li>
      ) : null}
      {section.links.map((link) => (
        <li key={link.href + link.label}>
          <SitemapAnchor link={link} className={styles.link} />
        </li>
      ))}
    </ul>
  )
}

function useFocusTarget() {
  return React.useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href') ?? ''
    if (!href.startsWith('#')) return
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    if (!target) return
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])
}

/**
 * The footer. In print only the imprint prints (organization, address,
 * contact written out, the print date, ©, colophon at 8–8.5 pt); the
 * sitemap, social links, buttons, forms, sign-off and back-to-top drop.
 */
export function Footer(props: FooterProps) {
  const {
    kind,
    preset,
    brand,
    blocks,
    sitemap = [],
    sitemapLabel = 'Site',
    address,
    contact = [],
    social = [],
    legal = [],
    copyright,
    colophon,
    organization,
    backToTop,
    straddle,
    headingLevel = 2,
    locale = 'en-GB',
    newsletterColumn,
    newsletter,
    newsletterUrl,
    signoff,
    wordmark,
    primary,
    secondary,
    className,
    ...rest
  } = props

  const resolvedKind = kind ?? 'guide'
  const isGuide = resolvedKind === 'guide'
  const HeadingTag = headingTags[headingLevel]
  const linkCount = sitemap.reduce((sum, section) => sum + section.links.length, 0)
  const collapsed = isGuide && linkCount > ACCORDION_THRESHOLD
  const withColumn = isGuide && newsletterColumn === true && newsletter != null
  const withSignoff = isGuide && signoff === true && wordmark != null
  const focusTarget = useFocusTarget()

  // The print date is the reader's, filled in on the client and refreshed before printing.
  const [printedOn, setPrintedOn] = React.useState<string | null>(null)
  React.useEffect(() => {
    const format = () =>
      setPrintedOn(
        new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
          new Date(),
        ),
      )
    format()
    window.addEventListener('beforeprint', format)
    return () => window.removeEventListener('beforeprint', format)
  }, [locale])

  const contactLine =
    contact.length > 0 ? (
      <p className={styles.contact}>
        {contact.map((item, index) => (
          <React.Fragment key={item.value}>
            {index > 0 ? ' · ' : null}
            {item.href ? (
              <a href={item.href} className={styles.contactLink}>
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </React.Fragment>
        ))}
      </p>
    ) : null

  const socialList =
    social.length > 0 ? (
      <ul className={styles.social}>
        {social.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={styles.socialLink}
              aria-label={item.icon != null ? item.label : undefined}
            >
              {item.icon != null ? (
                <span className={styles.socialIcon} aria-hidden="true">
                  {item.icon}
                </span>
              ) : (
                item.label
              )}
            </a>
          </li>
        ))}
      </ul>
    ) : null

  const legalRow =
    legal.length > 0 || copyright != null ? (
      <div className={styles.legal}>
        {legal.length > 0 ? (
          <nav aria-label="Legal">
            <ul className={styles.legalLinks}>
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    kind="nav"
                    muted
                    href={item.href}
                    className={styles.legalLink}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {copyright != null ? <p className={styles.copyright}>{copyright}</p> : null}
      </div>
    ) : null

  const colophonNode = colophon != null ? <p className={styles.colophon}>{colophon}</p> : null

  const backToTopNode = backToTop ? (
    <p className={styles.backToTop}>
      <Link kind="nav" list href={backToTop.href} className={styles.link} onClick={focusTarget}>
        {backToTop.label ?? 'Back to top'}
      </Link>
    </p>
  ) : null

  const imprint = (
    <div className={styles.imprint}>
      {organization != null ? <p className={styles.imprintName}>{organization}</p> : null}
      {address != null ? <div className={styles.imprintLine}>{address}</div> : null}
      {contact.length > 0 ? (
        <p className={styles.imprintLine}>{contact.map((item) => item.value).join(' · ')}</p>
      ) : null}
      {withColumn && newsletterUrl ? (
        <p className={styles.imprintLine}>
          Newsletter (<span className={styles.imprintUrl}>{newsletterUrl}</span>)
        </p>
      ) : null}
      {printedOn != null ? <p className={styles.imprintLine}>Printed on {printedOn}</p> : null}
      {copyright != null ? <p className={styles.imprintLine}>{copyright}</p> : null}
      {colophon != null ? <p className={styles.imprintLine}>{colophon}</p> : null}
    </div>
  )

  const groups = (
    <div className={styles.groups}>
      {sitemap.map((section) => (
        <div key={section.label} className={styles.group}>
          <HeadingTag className={styles.groupHeading}>
            {section.href ? (
              <Link kind="nav" list href={section.href} className={styles.groupLink}>
                {section.label}
                <Icon name="chevron_right" className={styles.chevron} />
              </Link>
            ) : (
              section.label
            )}
          </HeadingTag>
          {section.links.length > 0 ? <LinkList section={section} /> : null}
        </div>
      ))}
    </div>
  )

  const sitemapNav =
    sitemap.length > 0 ? (
      <nav className={styles.sitemap} aria-label={sitemapLabel}>
        {collapsed ? (
          <Accordion className={styles.sitemapAccordion}>
            {sitemap.map((section) => (
              <AccordionItem key={section.label} title={section.label} headingLevel={headingLevel}>
                <LinkList section={section} withIndex />
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
        {groups}
      </nav>
    ) : null

  let body: React.ReactNode

  if (resolvedKind === 'ruled') {
    const cells = sitemap.flatMap((section) =>
      section.href ? [{ label: section.label, href: section.href } as SitemapLink] : section.links,
    )
    body = (
      <>
        {cells.length > 0 ? (
          <nav className={styles.sitemap} aria-label={sitemapLabel}>
            <ul className={styles.cells}>
              {cells.map((link) => (
                <li key={link.href + link.label}>
                  <SitemapAnchor link={link} className={styles.cell} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className={styles.container}>
          {brand != null ? <div className={styles.brand}>{brand}</div> : null}
          {contact.length > 0 ? (
            <dl className={styles.contactRows}>
              {contact.map((item) => (
                <div key={item.value} className={styles.contactRow}>
                  <dt className={styles.contactLabel}>{item.label ?? ''}</dt>
                  <dd className={styles.contactValue}>
                    {item.href ? (
                      <a href={item.href} className={styles.contactLink}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {address != null ? <address className={styles.address}>{address}</address> : null}
          {socialList}
          {backToTopNode}
          {legalRow}
          {colophonNode}
          {imprint}
        </div>
      </>
    )
  } else if (resolvedKind === 'minimal') {
    const line = sitemap.flatMap((section) =>
      section.href ? [{ label: section.label, href: section.href } as SitemapLink] : section.links,
    )
    body = (
      <div className={styles.container}>
        {brand != null ? <div className={styles.brand}>{brand}</div> : null}
        {line.length > 0 ? (
          <nav className={styles.sitemap} aria-label={sitemapLabel}>
            <ul className={styles.linkLine}>
              {line.map((link) => (
                <li key={link.href + link.label}>
                  <SitemapAnchor link={link} className={styles.link} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {backToTopNode}
        {legalRow}
        {colophonNode}
        {imprint}
      </div>
    )
  } else {
    body = (
      <>
        <div className={styles.container}>
          {straddle}
          {blocks != null ? <div className={styles.blocks}>{blocks}</div> : null}
          <div className={styles.main}>
            {brand != null || address != null || contactLine != null || socialList != null ? (
              <div className={styles.brand}>
                {brand}
                {address != null ? <address className={styles.address}>{address}</address> : null}
                {contactLine}
                {socialList}
              </div>
            ) : null}
            {sitemapNav}
            {withColumn ? (
              <div className={styles.column}>
                <span className={styles.columnRule} aria-hidden="true" />
                {newsletter}
              </div>
            ) : null}
          </div>
          {backToTopNode}
          {legalRow}
          {colophonNode}
          {imprint}
        </div>
        {withSignoff ? (
          <p className={styles.wordmark} aria-hidden="true">
            {wordmark}
          </p>
        ) : null}
      </>
    )
  }

  return (
    <Ground
      {...rest}
      kind="band"
      preset={preset ?? (isGuide ? 'night' : 'paper')}
      // The color props override the preset's scales on the Ground itself,
      // so they never race its preset classes in the scales layer.
      primary={primary ?? undefined}
      secondary={secondary ?? undefined}
      render={<footer />}
      className={footer({
        kind: resolvedKind,
        signoff: withSignoff,
        newsletterColumn: withColumn,
        collapsed,
        className,
      })}
    >
      {body}
    </Ground>
  )
}

/** Props for FooterBlock: `section` props, the icon, heading, body and action. */
export type FooterBlockProps = Omit<React.ComponentPropsWithRef<'section'>, 'children'> & {
  /**
   * The block-tier icon (36 px, FILL 0): an inventory name, or a subject
   * symbol's SVG element in `currentColor`. It takes `--role-accent`.
   */
  icon?: IconName | React.ReactElement
  /** The heading, `type-itemhead` (an item head, not a section head). */
  heading: React.ReactNode
  /** The heading level. Default `2`. */
  headingLevel?: HeadingLevel
  /** The body, `type-body-ui`. */
  children?: React.ReactNode
  /** The action: a §9.2 Button, links or the §11.11 inline form. */
  action?: React.ReactNode
}

/** An action block: icon → heading (--size-px-3) → body (--size-px-7) → action (--size-px-7). */
export function FooterBlock(props: FooterBlockProps) {
  const { icon, heading, headingLevel = 2, children, action, className, ...rest } = props
  const headingId = React.useId()
  const HeadingTag = headingTags[headingLevel]
  return (
    <section
      {...rest}
      aria-labelledby={headingId}
      className={className ? `${styles.block} ${className}` : styles.block}
    >
      {icon != null ? (
        <span className={styles.blockIcon} aria-hidden="true">
          {typeof icon === 'string' ? <Icon name={icon} size="block" /> : icon}
        </span>
      ) : null}
      <HeadingTag id={headingId} className={styles.blockHeading}>
        {heading}
      </HeadingTag>
      {children != null ? <div className={styles.blockBody}>{children}</div> : null}
      {action != null ? <div className={styles.blockAction}>{action}</div> : null}
    </section>
  )
}
