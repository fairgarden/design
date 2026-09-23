'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../../actions/button'
import { Figure, FigureCaption, FigureMedia } from '../../data/figure'
import { ScrollArea } from '../../data/scroll-area'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScope, useScopeAttributes } from '../../utils/scope'
import styles from './carousel.module.css'

/*
 * Carousel (§12.4): secondary items in short horizontal space (similar
 * species, related products, photo sets), at least four. No Base UI
 * primitive exists, so it is composed: a `section` with
 * aria-roledescription="carousel", a Scroll Area in its `rail` kind
 * (§10.19: the viewport, and the horizontal scrollbar as the 2 px progress
 * rail), a `ul` of slides each labelled "n of N", Previous and Next Buttons
 * and a polite count. It never autoplays or loops, has no dots, and a
 * vertical wheel never moves the track [D186].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: carousel.module.css; CVA function `carousel`.
 * - Axes: `kind` → cards | photos → `cards`, `photos` (required); `post` →
 *   `post` (cards only: editorial post cards, 3 + peek from 1024 px;
 *   without it image and portrait cards, 2 + peek) [D186]; `atStart`,
 *   `atEnd` → `atStart`, `atEnd` and `static` → `static` are state classes
 *   the component computes from the Scroll Area (unmanaged element), never
 *   props; `summarized` (computed) marks a photo set of more than 6 for its
 *   print summary; `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: post false, atStart false, atEnd false, static false (`kind`
 *   is required); color axes: none [D133].
 * - Color fallback: inherits the scope and passes both props to the slides.
 *   Secondary drives none of the carousel's own parts.
 * - States: `prev` and `next` are §9.9 step-pager Buttons (the outline
 *   icon-only Button): `:hover` → the --primary3 fill with the edge
 *   unchanged, the glyph at the next tier's weight [D181]; `:focus-visible`
 *   → the ring; `:active` → the inverse pair [D84]. The Scroll Area's
 *   overflow attributes and its thumb states live in its module. `atStart`
 *   / `atEnd` → that button is omitted with its space kept; `static` →
 *   controls hidden (the rail hides itself without overflow).
 * - Parts: base, header, viewport (the Scroll Area root, with its
 *   Viewport), track (its Content, at the viewport's width through
 *   `fitContent={false}`), list, slide, controls, count, pager,
 *   prev, next (prevGlyph / nextGlyph are the Buttons' icons), rail and
 *   railThumb (the Scroll Area's scrollbar and thumb), printSummary.
 * - Scope: none.
 * - Container: `base` is the inline-size container `carousel`; the slide
 *   widths and, from 1024 px, the photo strip's fixed track height query
 *   it [D186]. Baseline without support: slide widths as percentages of the
 *   track, so the peek holds at any width; the stack step below 360 px has
 *   the --xs-n-below viewport fallback. `static` comes from measured
 *   overflow, not a query (§5.10.2) [D163].
 */
export const carousel = cva(styles.base, {
  variants: {
    kind: {
      cards: styles.cards,
      photos: styles.photos,
    },
    post: {
      true: styles.post,
    },
    atStart: {
      true: styles.atStart,
    },
    atEnd: {
      true: styles.atEnd,
    },
    static: {
      true: styles.static,
    },
    summarized: {
      true: styles.summarized,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    post: false,
    atStart: false,
    atEnd: false,
    static: false,
  },
})

type CarouselVariants = VariantProps<typeof carousel>

interface CarouselContextValue {
  total: number
}

const CarouselContext = React.createContext<CarouselContextValue>({ total: 0 })
const SlideIndexContext = React.createContext(0)

interface CarouselCommonProps extends Omit<React.ComponentPropsWithRef<'section'>, 'children'> {
  /** The carousel's accessible name, e.g. "Similar species". */
  label: string
  /** The module header (§11.8), above the track. */
  header?: React.ReactNode
  /** The slides: `CarouselSlide`s (cards) or `CarouselPhoto`s (photos), at least four. */
  children: React.ReactNode
  /** Previous and Next accessible names. Default "Previous" and "Next". */
  controlLabels?: readonly [previous: string, next: string]
  /**
   * The short URL printed after a photo set of more than 6 slides: "5 more
   * images (example.org/gallery)". No protocol.
   */
  printUrl?: string
  /**
   * Primary Radix scale: buttons, count, rail and thumb, and the slides'
   * inherited primary. Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: CarouselVariants['primary']
  /** Secondary Radix scale, passed to the slides; no carousel part uses it. Never defaulted. */
  secondary?: CarouselVariants['secondary']
}

interface CarouselCardsProps extends CarouselCommonProps {
  /**
   * `cards`: §12.2 cards, 2 portrait + peek (1 + peek below 360 px of
   * container). `photos`: captioned figures at ≈ 88%, each photo at most
   * 480 px tall, and from 1024 px a fixed 480 px strip whose slides keep
   * their photos' own ratios.
   */
  kind: 'cards'
  /**
   * Editorial post cards: 1 landscape slide at ≈ 85% at base, 2 + peek from
   * 768 px, 3 + peek from 1024 px of container [D186]. Default `false`.
   */
  post?: boolean
}

interface CarouselPhotosProps extends CarouselCommonProps {
  kind: 'photos'
  post?: never
}

/** Props for Carousel: `section` props, the kind (and `post` for cards), label, header, slides and the color axes. */
export type CarouselProps = CarouselCardsProps | CarouselPhotosProps

interface CarouselState {
  atStart: boolean
  atEnd: boolean
  isStatic: boolean
  current: number
}

const THIN = '\u2009'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function slidesOf(list: HTMLElement | null): HTMLElement[] {
  return list ? (Array.from(list.children) as HTMLElement[]) : []
}

/**
 * The carousel. Swipe, trackpad, the Previous and Next buttons, and the
 * arrow, Home and End keys on the focused track all move it one slide at a
 * time with snap. In print, card slides become a 2-up grid and photo sets
 * of up to 6 a 3-up grid; a larger photo set prints its first slide and
 * "n more images (short URL)".
 */
export function Carousel(props: CarouselProps) {
  const {
    kind,
    post,
    label,
    header,
    controlLabels = ['Previous', 'Next'],
    printUrl,
    primary,
    secondary,
    className,
    style,
    children,
    ...rest
  } = props

  const scope = useScope()
  const scopeAttributes = useScopeAttributes()
  const slides = React.Children.toArray(children).filter(React.isValidElement)
  const total = slides.length
  const summarized = kind === 'photos' && total > 6

  const rootRef = React.useRef<HTMLElement | null>(null)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)
  const [state, setState] = React.useState<CarouselState>({
    atStart: true,
    atEnd: false,
    isStatic: false,
    current: 1,
  })
  const [bleed, setBleed] = React.useState(0)

  const read = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const rtl = getComputedStyle(viewport).direction === 'rtl'
    const offset = Math.abs(viewport.scrollLeft)
    const max = viewport.scrollWidth - viewport.clientWidth
    const isStatic = max <= 1
    const atStart = offset <= 1
    const atEnd = isStatic || offset >= max - 1
    const edge = viewport.getBoundingClientRect()
    const items = slidesOf(listRef.current)
    let first = 0
    for (let index = 0; index < items.length; index += 1) {
      const rect = items[index].getBoundingClientRect()
      const lead = rtl ? edge.right - rect.right : rect.left - edge.left
      if (lead >= -2) {
        first = index
        break
      }
    }
    const current = atEnd && !isStatic ? total : first + 1
    setState((previous) =>
      previous.atStart === atStart &&
      previous.atEnd === atEnd &&
      previous.isStatic === isStatic &&
      previous.current === current
        ? previous
        : { atStart, atEnd, isStatic, current },
    )
  }, [total])

  // The end bleeds to the viewport edge on a band, to the field's inner
  // edge inside a field, and not at all inside a face [D186].
  const measureBleed = React.useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const rtl = getComputedStyle(root).direction === 'rtl'
    let edge: number | null = null
    if (scope.kind === 'band') {
      edge = rtl ? 0 : document.documentElement.clientWidth
    } else if (scope.kind === 'field') {
      const field = root.parentElement?.closest<HTMLElement>('[data-theme]')
      if (field) {
        const box = field.getBoundingClientRect()
        const start = box.left + field.clientLeft
        edge = rtl ? start : start + field.clientWidth
      }
    }
    const next =
      edge == null ? 0 : Math.max(0, Math.round(rtl ? rect.left - edge : edge - rect.right))
    setBleed((previous) => (previous === next ? previous : next))
  }, [scope.kind])

  React.useEffect(() => {
    const viewport = viewportRef.current
    const root = rootRef.current
    if (!viewport || !root) return undefined
    // A vertical wheel passes to the page: the track scrolls on horizontal
    // intent only, and never holds vertical scroll chaining [D186].
    viewport.style.overscrollBehaviorY = 'auto'

    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        measureBleed()
        read()
      })
    }
    schedule()
    viewport.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const observer = new ResizeObserver(schedule)
    observer.observe(root)
    observer.observe(viewport)
    if (listRef.current) observer.observe(listRef.current)
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
    }
  }, [read, measureBleed])

  const scrollToIndex = React.useCallback((index: number) => {
    const viewport = viewportRef.current
    const items = slidesOf(listRef.current)
    const target = items[Math.max(0, Math.min(items.length - 1, index))]
    if (!viewport || !target) return
    const rtl = getComputedStyle(viewport).direction === 'rtl'
    const edge = viewport.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    const delta = rtl ? rect.right - edge.right : rect.left - edge.left
    viewport.scrollBy({ left: delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [])

  const step = React.useCallback(
    (direction: 1 | -1) => {
      // From the end, Previous returns to the slide before the first one in view.
      const from =
        state.atEnd && !state.isStatic
          ? firstInView(viewportRef.current, listRef.current)
          : state.current - 1
      scrollToIndex(from + direction)
    },
    [scrollToIndex, state.atEnd, state.isStatic, state.current],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== viewportRef.current) return
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (event.key === forward) step(1)
    else if (event.key === back) step(-1)
    else if (event.key === 'Home') scrollToIndex(0)
    else if (event.key === 'End') scrollToIndex(total - 1)
    else return
    event.preventDefault()
  }

  const context = React.useMemo(() => ({ total }), [total])
  const bleedStyle = { ...style, '--carousel-bleed': `${bleed}px` } as React.CSSProperties

  return (
    <section
      {...rest}
      {...scopeAttributes}
      ref={rootRef}
      style={bleedStyle}
      aria-roledescription="carousel"
      aria-label={label}
      className={carousel({
        kind,
        post: kind === 'cards' && post === true,
        atStart: state.atStart,
        atEnd: state.atEnd,
        static: state.isStatic,
        summarized,
        primary,
        secondary,
        className,
      })}
    >
      {header != null ? <div className={styles.header}>{header}</div> : null}
      <ScrollArea
        kind="rail"
        label="Slides"
        viewportRef={viewportRef}
        className={styles.viewport}
        // The track (the Scroll Area's content) keeps the viewport's width, so
        // slide percentages resolve against it with no intrinsic-size loop;
        // the slides overflow it and the viewport scrolls them.
        fitContent={false}
        onKeyDown={onKeyDown}
      >
        <ul ref={listRef} className={styles.list}>
          <CarouselContext.Provider value={context}>
            {slides.map((slide, index) => (
              <SlideIndexContext.Provider key={slide.key ?? index} value={index}>
                {slide}
              </SlideIndexContext.Provider>
            ))}
          </CarouselContext.Provider>
        </ul>
      </ScrollArea>
      <div className={styles.controls}>
        <p className={styles.count} aria-live="polite">
          {state.current}
          {THIN}of{THIN}
          {total}
        </p>
        <div className={styles.pager}>
          <Button
            variant="outline"
            iconOnly
            icon="chevron_left"
            className={styles.prev}
            onClick={() => step(-1)}
          >
            {controlLabels[0]}
          </Button>
          <Button
            variant="outline"
            iconOnly
            icon="chevron_right"
            className={styles.next}
            onClick={() => step(1)}
          >
            {controlLabels[1]}
          </Button>
        </div>
      </div>
      {summarized ? (
        <p className={styles.printSummary}>
          {total - 1} more images
          {printUrl ? (
            <>
              {' '}
              (<span className={styles.printUrl}>{printUrl}</span>)
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  )
}

/** The index of the first slide whose leading edge is in view. */
function firstInView(viewport: HTMLElement | null, list: HTMLElement | null): number {
  if (!viewport) return 0
  const rtl = getComputedStyle(viewport).direction === 'rtl'
  const edge = viewport.getBoundingClientRect()
  const items = slidesOf(list)
  for (let index = 0; index < items.length; index += 1) {
    const rect = items[index].getBoundingClientRect()
    if ((rtl ? edge.right - rect.right : rect.left - edge.left) >= -2) return index
  }
  return 0
}

/** Props for CarouselSlide: `li` props and, for photo slides, the photo's ratio. */
export type CarouselSlideProps = React.ComponentPropsWithRef<'li'> & {
  /**
   * The photo's width ÷ height (e.g. `3 / 2`). From 1024 px of container
   * the photo strip sizes the slide from it at the 480 px track height, so
   * nothing is cropped [D186].
   */
  ratio?: number
}

/**
 * One slide, labelled "n of N" for assistive technology. It snaps to its
 * start; slides are focusable only through their own links.
 */
export function CarouselSlide(props: CarouselSlideProps) {
  const { ratio, className, style, ...rest } = props
  const { total } = React.useContext(CarouselContext)
  const index = React.useContext(SlideIndexContext)
  const ratioStyle =
    ratio == null ? style : ({ ...style, '--carousel-ratio': String(ratio) } as React.CSSProperties)
  return (
    <li
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      {...rest}
      style={ratioStyle}
      className={className ? `${styles.slide} ${className}` : styles.slide}
    />
  )
}

/** Props for CarouselPhoto: the image, its ratio and the caption. */
export interface CarouselPhotoProps {
  /** The image source. */
  src: string
  /** The alternative text; empty only for a decorative photo. */
  alt: string
  /** The photo's own width ÷ height (e.g. `3 / 2`), so the strip never crops it. */
  ratio: number
  /** The caption: what to notice. Always visible, right-flush. */
  caption?: React.ReactNode
  /** The credit, in the same run: "Photo: Name / Program". */
  credit?: React.ReactNode
  /** Image `srcSet`, `sizes`, `loading` and other attributes. */
  imgProps?: Omit<React.ComponentPropsWithRef<'img'>, 'src' | 'alt'>
}

/**
 * A photo slide: a §8.5 photo Figure with the image at its own ratio and
 * the caption right-flush under it.
 */
export function CarouselPhoto(props: CarouselPhotoProps) {
  const { src, alt, ratio, caption, credit, imgProps } = props
  return (
    <CarouselSlide ratio={ratio}>
      <Figure kind="photo" className={styles.photo}>
        <FigureMedia>
          <img
            loading="lazy"
            decoding="async"
            {...imgProps}
            src={src}
            alt={alt}
            style={{ ...imgProps?.style, aspectRatio: String(ratio) }}
          />
        </FigureMedia>
        {caption != null || credit != null ? (
          <FigureCaption credit={credit}>{caption}</FigureCaption>
        ) : null}
      </Figure>
    </CarouselSlide>
  )
}
