import { EXPAND_DURATION_MS, EXPAND_EASE, SURFACE_DURATION_MS } from '../../utils/tokens'

/*
 * The outline morph's engine: plain DOM and the Web Animations API, no
 * React. `useOutlineMorph` owns one controller per trigger and popup pair.
 *
 * Geometry. Every box is the outer edge of a frame: the focus ring (the
 * trigger's border box grown by the outline's offset and width, each outer
 * radius r + offset + width, as the browser draws a rounded outline), the
 * trigger's edge (its border box and radii), or the popup's frame (its
 * border box and radii). Radii are per corner and clamped as CSS clamps
 * them, so a pill trigger starts as the pill it is and an ear with two
 * square corners keeps them. The overlay frame is absolutely positioned
 * in the popup's positioned container, so boxes are kept in that
 * container's coordinates: the frame moves with the popup and never takes
 * part in layout (a modal surface, which has no positioner, puts it in a
 * fixed full-viewport layer). Its box, radii and edge color animate; it
 * moves by a pure translation and resizes by width and height, never a
 * scale, so the edge stays crisp. Its edge weight never tweens: where the
 * start's weight and the popup's differ (a 2 px ring into a 3 px panel), it
 * steps once, at WEIGHT_STEP of the eased travel, while the frame moves
 * fastest. A popup side with no edge of its own that lies on the viewport's
 * edge (a sheet) is landed on one weight past it, so that edge leaves the
 * screen rather than popping at the hand-off. The popup is
 * clipped to the same box (an `inset() round` clip on the same timing), so
 * its contents appear inside the growing frame; nothing animates opacity.
 * While a morph runs, the end it travels to is re-measured every frame, so
 * a scroll, resize or late popup size change bends the path instead of
 * leaving the frame behind; a close also re-reads which ring it lands on,
 * so focus leaving the field mid-close lands on the field's edge.
 */

/** The attribute the popup carries while the overlay draws its frame. */
export const OUTLINE_MORPH_ATTRIBUTE = 'data-outline-morph'

/**
 * The app-wide (and per-subtree) switch: `none` on the trigger or the popup
 * (inherited, so `:root` turns every morph off) leaves every popup its own
 * open and close. Read at each open and close.
 */
export const OUTLINE_MORPH_PROPERTY = '--fgd-outline-morph'

/**
 * The popup's attribute while an open waits for its placement (a frame or
 * two, at most PLACEMENT_FRAMES): the foundation's CSS holds the popup
 * clipped away meanwhile (still focusable, as Base UI moves focus in during
 * the wait), a discrete hold, so it never paints unclipped before the morph
 * starts [D196]. A timeout removes it and the popup shows at once.
 */
export const OUTLINE_MORPH_PENDING_ATTRIBUTE = 'data-outline-morph-pending'

/** The overlay frame's attribute while it shows. */
const RUNNING_ATTRIBUTE = 'data-running'

/** The tail cap's placement and face, custom properties the engine sets on it (never real properties). */
const TAIL_X = '--fgd-outline-morph-tail-x'
const TAIL_Y = '--fgd-outline-morph-tail-y'
const TAIL_FILL = '--fgd-outline-morph-tail-fill'

/**
 * The frame's offset in its container and its size, as registered
 * `<length>` properties so the Web Animations API interpolates them; the
 * frame's CSS rounds them to whole pixels for its `translate`, `width` and
 * `height`, so the edge is never painted at a fractional position (which
 * would soften it across three pixels) and the last frame paints the
 * popup's own pixel-snapped edges, whatever its fractional size.
 */
const OFFSET_X = '--fgd-outline-morph-x'
const OFFSET_Y = '--fgd-outline-morph-y'
const SIZE_W = '--fgd-outline-morph-w'
const SIZE_H = '--fgd-outline-morph-h'

/**
 * The frame's paint, also as registered properties (radii, edge color and
 * weight), which the frame's CSS maps to `border-radius`, `border-color` and
 * `border-width`, so the animation writes custom properties only.
 */
const RADII = ['--fgd-outline-morph-r1', '--fgd-outline-morph-r2', '--fgd-outline-morph-r3', '--fgd-outline-morph-r4'] as const
const EDGE_COLOR = '--fgd-outline-morph-color'
const EDGE_WEIGHT = '--fgd-outline-morph-weight'

let offsetMode: 'rounded' | 'plain' | undefined

/**
 * Registers the offset and size properties once. Where registration or CSS
 * `round()` is missing, the frame animates `translate`, `width` and
 * `height` itself (fractional).
 */
function frameOffsetMode(): 'rounded' | 'plain' {
  if (offsetMode) return offsetMode
  offsetMode = 'plain'
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return offsetMode
  if (!CSS.supports('translate', 'round(1.5px, 1px) round(1.5px, 1px)')) return offsetMode
  const properties: [string, string, string][] = [
    ...[OFFSET_X, OFFSET_Y, SIZE_W, SIZE_H, ...RADII, EDGE_WEIGHT].map(
      (name): [string, string, string] => [name, '<length>', '0px']
    ),
    [EDGE_COLOR, '<color>', 'transparent'],
  ]
  for (const [name, syntax, initialValue] of properties) {
    try {
      CSS.registerProperty({ name, syntax, inherits: false, initialValue })
    } catch {
      // Already registered (another copy of the module, or a hot reload).
    }
  }
  offsetMode = 'rounded'
  return offsetMode
}

/** Durations in ms: `open` grows the outline into the frame, `close` is the faster way back. */
export type OutlineMorphDuration = { open: number; close: number }

/**
 * How the trigger draws its focus ring, so the engine knows when it shows:
 * - `focus-visible`: on the trigger itself while it matches `:focus-visible`
 *   (buttons, menu triggers, the Select trigger). Focus moves into the popup
 *   while it is open and comes back on close.
 * - `focus-within`: on the trigger (a field's box) whenever anything inside
 *   it holds focus, pointer focus included (Combobox, Autocomplete, Search:
 *   `:has(:focus)` or `data-focused`). Focus stays in the input while the
 *   popup is open, so the ring stays drawn and a close lands on it.
 */
export type OutlineMorphRing = 'focus-visible' | 'focus-within'

type Rect = { x: number; y: number; w: number; h: number }

/** Outer corner radii, physical: top-left, top-right, bottom-right, bottom-left. */
type Radii = [number, number, number, number]

type Box = Rect & {
  r: Radii
  color: string
  /** The edge weight at this end (px), or null to take the other end's (a solid fill has none of its own). */
  k: number | null
}

/** Which ring the trigger shows (or will show when focus returns). */
type Ring = 'drawn' | 'predicted' | 'none'

type Phase = 'idle' | 'pending' | 'opening' | 'open' | 'closing' | 'closed'

/** Where a running morph is headed: the popup's frame, or the trigger. */
type Toward = { kind: 'target' } | { kind: 'source'; ring: Ring }

/** A morph resumed from its current state never runs shorter than this share of its duration. */
const MIN_RESUME_SHARE = 0.35

/** Frames to wait for the popup to be placed before letting it open its own way. */
const PLACEMENT_FRAMES = 8

/** How long a landed close waits for the popup to hide before clearing the frame itself. */
const SETTLE_MS = 120

/** Re-measured ends closer than this (px) leave the keyframes alone. */
const DRIFT_PX = 0.5

/** How far inside the frame's outer edge the popup's clip runs (px); less than the edge weight. */
const CLIP_INSET_PX = 1

/** An open's start may still move onto a ring drawn late while its progress is under this share. */
const EARLY_PROGRESS = 0.25

/** Where on the eased travel (0–1) the frame's edge weight steps, when its two ends differ. */
const WEIGHT_STEP = 0.15

function px(value: string): number {
  const number = parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

function camel(property: string): string {
  return property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function toRect(rect: DOMRect): Rect {
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
}

function drifted(a: Rect, b: Rect): boolean {
  return (
    Math.abs(a.x - b.x) > DRIFT_PX ||
    Math.abs(a.y - b.y) > DRIFT_PX ||
    Math.abs(a.w - b.w) > DRIFT_PX ||
    Math.abs(a.h - b.h) > DRIFT_PX
  )
}

/** A computed color's alpha: 0 for `transparent`, else its `/ a` or `rgba()` alpha, else 1. */
function alphaOf(color: string): number {
  const value = color.trim()
  if (value === '' || value === 'transparent') return 0
  const slash = value.match(/\/\s*([\d.]+)(%?)\s*\)$/)
  if (slash) return slash[2] ? parseFloat(slash[1]) / 100 : parseFloat(slash[1])
  const rgba = value.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/)
  if (rgba) return parseFloat(rgba[1])
  return 1
}

/** One corner's horizontal radius from its computed value ("12px", "12px 6px" or "50%"). */
function cornerRadius(value: string, basis: number): number {
  const first = value.trim().split(/\s+/)[0] ?? '0'
  return first.endsWith('%') ? (parseFloat(first) / 100) * basis : px(first)
}

/**
 * Scales radii down as CSS does when adjacent corners overflow a side
 * (CSS Backgrounds 3, corner overlap), so `--radius-round` reads as the
 * pill's half-height, never 100000 px.
 */
function clampRadii(r: Radii, w: number, h: number): Radii {
  let factor = 1
  const sides: [number, number][] = [
    [r[0] + r[1], w],
    [r[1] + r[2], h],
    [r[2] + r[3], w],
    [r[3] + r[0], h],
  ]
  for (const [sum, length] of sides) {
    if (sum > length && sum > 0) factor = Math.min(factor, Math.max(0, length) / sum)
  }
  return factor < 1 ? (r.map((value) => value * factor) as Radii) : r
}

/** An element's used corner radii for a box of w × h. */
function usedRadii(style: CSSStyleDeclaration, w: number, h: number): Radii {
  return clampRadii(
    [
      cornerRadius(style.borderTopLeftRadius, w),
      cornerRadius(style.borderTopRightRadius, w),
      cornerRadius(style.borderBottomRightRadius, w),
      cornerRadius(style.borderBottomLeftRadius, w),
    ],
    w,
    h
  )
}

/**
 * A property's value once its running CSS transition lands: the transition's
 * end keyframe, else the computed value. The trigger's edge steps color on
 * open and close, and the frame must meet the step's end, not its start.
 */
function settledValue(element: Element, property: string): string {
  const current = getComputedStyle(element).getPropertyValue(property)
  if (typeof CSSTransition === 'undefined') return current
  for (const animation of element.getAnimations()) {
    if (!(animation instanceof CSSTransition) || animation.transitionProperty !== property) continue
    const frames = (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? []
    const end = frames[frames.length - 1]?.[camel(property)]
    if (typeof end === 'string') return end
  }
  return current
}

/**
 * Whether the morph may run now: Web Animations, motion allowed, no forced
 * colors, not printing. Read at each open, so a preference change applies
 * to the next one.
 */
export function canOutlineMorph(): boolean {
  if (typeof window === 'undefined' || typeof Element.prototype.animate !== 'function') {
    return false
  }
  if (typeof window.matchMedia !== 'function') return true
  return !(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(forced-colors: active)').matches ||
    window.matchMedia('print').matches
  )
}

/** A morph's timing: open and close durations (ms) and the easing, as the trigger resolves the tokens. */
type MorphTiming = OutlineMorphDuration & { ease: string }

/** A `<time>` custom property's computed value in ms ("333ms", "0.2s", "0ms"), or null. */
function timeMs(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)(ms|s)$/)
  if (!match) return null
  const number = parseFloat(match[1]) * (match[2] === 's' ? 1000 : 1)
  return Number.isFinite(number) ? Math.max(0, number) : null
}

const easeChecked = new Map<string, boolean>()

/** Whether the Web Animations API accepts the easing (a `linear()` token needs a recent engine). */
function easeValid(ease: string): boolean {
  let valid = easeChecked.get(ease)
  if (valid === undefined) {
    try {
      document.createElement('div').animate([], { duration: 1, easing: ease }).cancel()
      valid = true
    } catch {
      valid = false
    }
    easeChecked.set(ease, valid)
  }
  return valid
}

/**
 * The morph's timing from the tokens as the trigger resolves them, read at
 * each open and close: `--fgd-duration-expand`, `--fgd-duration-collapse`
 * (else `--fgd-duration-disclosure`) and `--fgd-ease-expand`, so an app's
 * override reaches the morph; a modal surface (`surface`) reads
 * `--fgd-duration-expand-surface` and `--fgd-duration-collapse-surface`. The JS mirrors (utils/tokens.ts) are only the
 * fallback for a value that can't be read; `override` (the hook's
 * `duration` option) wins over the duration tokens.
 */
function readTiming(
  source: HTMLElement,
  override: OutlineMorphDuration | undefined,
  surface: boolean
): MorphTiming {
  const style = getComputedStyle(source)
  const token = (name: string) => style.getPropertyValue(name)
  const open =
    override?.open ??
    (surface
      ? (timeMs(token('--fgd-duration-expand-surface')) ?? SURFACE_DURATION_MS.open)
      : (timeMs(token('--fgd-duration-expand')) ?? EXPAND_DURATION_MS.open))
  const close =
    override?.close ??
    (surface
      ? (timeMs(token('--fgd-duration-collapse-surface')) ?? SURFACE_DURATION_MS.close)
      : (timeMs(token('--fgd-duration-collapse')) ??
        timeMs(token('--fgd-duration-disclosure')) ??
        EXPAND_DURATION_MS.close))
  const ease = token('--fgd-ease-expand').trim().replace(/\s+/g, ' ')
  return { open, close, ease: ease && easeValid(ease) ? ease : EXPAND_EASE }
}

/** Whether `--fgd-outline-morph: none` applies to the element (inherited from any ancestor). */
function switchedOff(element: Element | null): boolean {
  if (!element) return false
  return getComputedStyle(element).getPropertyValue(OUTLINE_MORPH_PROPERTY).trim() === 'none'
}

/** Whether the trigger is rendered (a trigger hidden by `display: none` has no box to morph from). */
function rendered(element: HTMLElement): boolean {
  return element.isConnected && element.getClientRects().length > 0
}

/** Whether the element paints an outline now. */
function outlineShown(style: CSSStyleDeclaration): boolean {
  return style.outlineStyle !== 'none' && px(style.outlineWidth) > 0
}

/** Whether the trigger draws its focus ring now, as its ring mode draws it. */
function ringDrawn(source: HTMLElement, mode: OutlineMorphRing): boolean {
  const focused =
    mode === 'focus-within' ? source.matches(':focus-within') : source.matches(':focus-visible')
  return focused && outlineShown(getComputedStyle(source))
}

/** Whether focus sits in the trigger or the popup's container (so it stays with, or comes back to, the trigger). */
function focusHeld(source: HTMLElement, popup: readonly (HTMLElement | null)[]): boolean {
  const active = document.activeElement
  if (!active || active === document.body) return false
  return source.contains(active) || popup.some((element) => element?.contains(active) ?? false)
}

/**
 * Resolves a length token's computed value (a custom property's, with
 * `calc()` and font-relative units unresolved) to px, in the context of the
 * element whose token it is.
 */
type LengthResolver = (value: string, context: HTMLElement) => number

/** A registered `<length>` the engine sets on a trigger for a moment to resolve its ring tokens there. */
const PROBE = '--fgd-outline-morph-probe'

let probeRegistered: boolean | undefined

function probeReady(): boolean {
  if (probeRegistered !== undefined) return probeRegistered
  probeRegistered = false
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return false
  try {
    CSS.registerProperty({ name: PROBE, syntax: '<length>', inherits: false, initialValue: '0px' })
  } catch {
    // Already registered (another copy of the module, or a hot reload).
  }
  probeRegistered = true
  return true
}

/**
 * A length token as the element itself resolves it (so `1lh` and `em` are
 * its own): set for a moment as a registered `<length>` on the element,
 * whose computed value is absolute, then removed again (never a rewrite of
 * the element's style attribute). Null where registration is missing.
 */
function resolveOn(element: HTMLElement, value: string): number | null {
  if (!probeReady()) return null
  const hadStyle = element.hasAttribute('style')
  element.style.setProperty(PROBE, value)
  const resolved = getComputedStyle(element).getPropertyValue(PROBE)
  // Only the engine's own property goes; an attribute the probe created goes with it.
  element.style.removeProperty(PROBE)
  if (!hadStyle && element.getAttribute('style') === '') element.removeAttribute('style')
  return resolved ? px(resolved) : null
}

/**
 * The focus ring's outer box, in viewport coordinates. Drawn: the
 * trigger's computed outline (its color as its transition lands).
 * Predicted (focus is elsewhere and returns with a ring): the system's ring
 * tokens as the trigger resolves them, `--fgd-focus-width` solid
 * `--primary12` at `--fgd-focus-offset` [D45]; a trigger whose ring sits
 * elsewhere (inset) sets those tokens on itself.
 */
function ringBox(source: HTMLElement, drawn: boolean, resolve: LengthResolver): Box {
  const rect = source.getBoundingClientRect()
  const style = getComputedStyle(source)
  const width = drawn
    ? px(style.outlineWidth)
    : resolve(style.getPropertyValue('--fgd-focus-width'), source)
  const offset = drawn
    ? px(style.outlineOffset)
    : resolve(style.getPropertyValue('--fgd-focus-offset'), source)
  const color = drawn
    ? settledValue(source, 'outline-color')
    : style.getPropertyValue('--primary12').trim() || style.color
  const out = width + offset
  const w = rect.width + 2 * out
  const h = rect.height + 2 * out
  // A rounded corner's outline is rounded by offset + width more; a square one stays square.
  const inner = usedRadii(style, rect.width, rect.height)
  const r = inner.map((radius) => (radius > 0 ? Math.max(0, radius + out) : 0)) as Radii
  return { x: rect.left - out, y: rect.top - out, w, h, r: clampRadii(r, w, h), color, k: width }
}

/** Whether the trigger has a visible boxed edge (all four sides), rather than an underline, a fill or none. */
function hasBoxEdge(style: CSSStyleDeclaration): boolean {
  return (
    style.borderTopStyle !== 'none' &&
    px(style.borderTopWidth) > 0 &&
    px(style.borderRightWidth) > 0 &&
    px(style.borderBottomWidth) > 0 &&
    px(style.borderLeftWidth) > 0 &&
    alphaOf(style.borderTopColor) > 0
  )
}

/**
 * The trigger's own edge, in viewport coordinates, where the morph starts
 * and lands without a ring: its border box and radii in the color of its
 * boxed edge (as that edge's transition lands), else its border box in its
 * opaque fill (a solid button); a trigger with neither (a text button, an
 * underline, a bare glyph, a menubar item) has no edge of its own, so its
 * ring's box stands in, in its ink. The color is always opaque, so the
 * frame never fades in.
 */
function edgeBox(source: HTMLElement, resolve: LengthResolver): Box {
  const rect = source.getBoundingClientRect()
  const style = getComputedStyle(source)
  const box = (color: string, k: number | null): Box => ({
    ...toRect(rect),
    r: usedRadii(style, rect.width, rect.height),
    color,
    k,
  })
  if (hasBoxEdge(style)) return box(settledValue(source, 'border-top-color'), px(style.borderTopWidth))
  const fill = settledValue(source, 'background-color')
  // A fill has no edge weight of its own: the frame keeps the popup's, drawn inside it in its color.
  if (alphaOf(fill) >= 1) return box(fill, null)
  return { ...ringBox(source, false, resolve), color: style.color }
}

/** Where the morph starts or lands on the trigger: the ring while one is (or will be) drawn, else its edge. */
function sourceBox(source: HTMLElement, ring: Ring, resolve: LengthResolver): Box {
  if (ring === 'drawn') return ringBox(source, true, resolve)
  if (ring === 'predicted') return ringBox(source, false, resolve)
  return edgeBox(source, resolve)
}

/**
 * The popup's own frame, read while its border shows: radii; the weight
 * and color of its edge (its widest side's), or null for a popup with no
 * edge at all (a full sheet), which keeps the start's; and each side's
 * weight, physical (top, right, bottom, left), for the bleed landing.
 */
type TargetFrame = {
  r: Radii
  color: string | null
  width: number | null
  sides: [number, number, number, number]
}

/** Which way the popup edge a tail sits on faces: toward the trigger. */
type TailNormal = 'up' | 'down' | 'left' | 'right'

/**
 * A tail riding the morph (the tail cap, §9.17): the popup's own tail's
 * box in the container's coordinates (its centre, its unrotated layout
 * size, its depth `d` including the overlap with the popup's edge) and the
 * way its popup edge faces. `side` is Base UI's `data-side`, copied to the
 * cap so the adopter's CSS rotates it as it rotates the tail.
 */
type TailFlight = { cx: number; cy: number; w: number; h: number; d: number; normal: TailNormal; side: string }

/** A running morph, in the container's coordinates. */
type Flight = {
  from: Box
  to: Box
  toward: Toward
  /** The popup's border box; the clip is relative to it. */
  target: Rect
  /** The edge weight at each end (px); the frame steps between them once, at WEIGHT_STEP. */
  fromK: number
  toK: number
  /** A fresh open's start: the ring it started on, or `none` (the edge). */
  fromRing?: Ring
  /** A fresh open's trigger box relative to the container when it started (the early re-measure). */
  sourceAt?: Rect
}

/**
 * The controller behind `useOutlineMorph`. Elements arrive through the ref
 * callbacks; `update` receives the open state in a layout effect, so both
 * directions start in the commit that changes the popup, before it paints.
 */
export class OutlineMorphController {
  /** Explicit durations (the hook's `duration` option); otherwise the tokens are read at each open and close. */
  duration: OutlineMorphDuration | undefined = undefined
  ring: OutlineMorphRing = 'focus-visible'
  /** A modal surface (a dialog, a sheet): the `-surface` durations. */
  surface = false
  /** The timing of the running morph, read from the trigger when it started. */
  private timing: MorphTiming = { ...EXPAND_DURATION_MS, ease: EXPAND_EASE }

  /** Every trigger attached (a popup may have several); `source` is the one this open came from. */
  private sources = new Set<HTMLElement>()
  private source: HTMLElement | null = null
  private target: HTMLElement | null = null
  private frame: HTMLElement | null = null
  /** The popup's own tail (an adopter's arrow) and the cap that stands in for it while the morph runs. */
  private tailSource: HTMLElement | null = null
  private tail: HTMLElement | null = null
  private tailAnimation: Animation | null = null
  private tailFlight: TailFlight | null = null

  private phase: Phase = 'idle'
  private open = false
  /** Whether the morph was on at the last update (a popup mounting before its open reaches us is held if so). */
  private enabled = true
  private anticipateFrame = 0
  /**
   * Where a pending open starts (viewport coordinates), the share of the
   * open duration it runs, and, for a fresh open, the ring it started from.
   */
  private pending: { from: Box; share: number; ring?: Ring } | null = null
  private flight: Flight | null = null
  private frameAnimation: Animation | null = null
  private targetAnimation: Animation | null = null
  /** The popup's own frame, read while it shows (its border is the face while the morph runs). */
  private targetFrame: TargetFrame | null = null

  private placementObserver: MutationObserver | null = null
  private placementFrame = 0
  private placementTries = 0
  private trackFrame = 0
  private settleObserver: MutationObserver | null = null
  private settleTimer: ReturnType<typeof setTimeout> | undefined

  /** A trigger: its focus ring (or edge) is where the morph starts and lands. */
  readonly sourceRef = (element: HTMLElement | null) => {
    if (element) this.sources.add(element)
  }

  /** The popup: its border box and radius are the frame the morph grows into. */
  readonly targetRef = (element: HTMLElement | null) => {
    if (element === this.target) return
    // Another popup element: the old one's morph ends with it.
    if (element && this.target && this.phase !== 'pending') this.stop()
    this.target = element
    // A popup (re)attached while a fresh open waits is held too.
    if (element && this.phase === 'pending' && this.pending?.ring !== undefined) {
      element.setAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE, '')
    } else if (element && this.phase === 'idle' && !this.open && this.enabled) {
      this.anticipate(element)
    }
    if (element) this.watchPlacement()
    else this.detachSoon()
  }

  /** The popup's own tail, if it has one: the cap draws its copy while the morph runs [§9.17]. */
  readonly tailSourceRef = (element: HTMLElement | null) => {
    this.tailSource = element
  }

  /** The tail cap, the overlay's tail, rendered after the frame in the same container. */
  readonly tailRef = (element: HTMLElement | null) => {
    if (element === this.tail) return
    this.tail?.removeAttribute(RUNNING_ATTRIBUTE)
    this.tail = element
  }

  /** The overlay frame, a sibling of the popup inside its positioned container. */
  readonly frameRef = (element: HTMLElement | null) => {
    if (element === this.frame) return
    if (element && this.frame && this.phase !== 'pending') this.stop()
    this.frame = element
    if (element) this.watchPlacement()
    else this.detachSoon()
  }

  /**
   * A popup mounted before its open reaches the controller (its owner's
   * open state can land a commit after Base UI's): held as a pending open
   * would be, if the morph would run, so it never paints unclipped first.
   * The open claims the hold; if none comes within two frames, it goes.
   */
  private anticipate(element: HTMLElement): void {
    const source = this.pickSource()
    if (!source || !canOutlineMorph() || switchedOff(source)) return
    if (!rendered(source) || readTiming(source, this.duration, this.surface).open <= 0) return
    element.setAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE, '')
    if (this.anticipateFrame) cancelAnimationFrame(this.anticipateFrame)
    this.anticipateFrame = requestAnimationFrame(() => {
      this.anticipateFrame = requestAnimationFrame(() => {
        this.anticipateFrame = 0
        if (this.phase !== 'pending') element.removeAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE)
      })
    })
  }

  /**
   * The trigger this open belongs to: the only one attached, else the one
   * marked open (Base UI's `aria-expanded` / `data-popup-open`), else the
   * one holding focus, else the last attached. Detached ones are dropped.
   */
  private pickSource(): HTMLElement | null {
    for (const element of this.sources) {
      if (!element.isConnected) this.sources.delete(element)
    }
    const list = [...this.sources]
    if (list.length <= 1) return list[0] ?? null
    const active = document.activeElement
    return (
      list.find(
        (element) =>
          element.getAttribute('aria-expanded') === 'true' || element.hasAttribute('data-popup-open')
      ) ??
      list.find((element) => active != null && element.contains(active)) ??
      list[list.length - 1]
    )
  }

  /**
   * The popup or the frame detached: once the commit is over, a running
   * morph stops if it is still gone. A ref that is only reattached (a
   * merged ref's new identity, React's development double mount) comes
   * back within the same commit, and a pending open keeps waiting for it.
   */
  private detachSoon(): void {
    queueMicrotask(() => {
      if ((this.target && this.frame) || this.phase === 'pending') return
      this.stop()
    })
  }

  /** The popup's positioned container, which also holds the frame. */
  private get container(): HTMLElement | null {
    return this.frame?.parentElement ?? null
  }

  /**
   * A length token's px value: a plain length as is, else resolved on the
   * trigger itself (`resolveOn`), else through the frame's own
   * `outline-offset` (the frame is ours, hidden while idle, and its CSS
   * never sets that property), since a custom property's computed value
   * keeps `calc()` and font-relative units unresolved.
   */
  private readonly resolveLength: LengthResolver = (value, context) => {
    const raw = value.trim()
    if (raw === '' || /^-?[\d.]+px$/.test(raw)) return px(raw)
    const own = resolveOn(context, raw)
    if (own !== null) return own
    const probe = this.frame
    if (!probe) return px(raw)
    probe.style.setProperty('outline-offset', raw)
    const resolved = px(getComputedStyle(probe).outlineOffset)
    probe.style.removeProperty('outline-offset')
    return resolved
  }

  /**
   * Receives the open state, and whether the morph is on, after each commit.
   * Off (`enabled` false) stops a running morph, so the change the commit
   * carries happens the popup's own way.
   */
  update(open: boolean, enabled: boolean): void {
    const wasOpen = this.open
    this.open = open
    this.enabled = enabled
    if (!enabled) {
      // Also records a popup opened this way as open, so a later close can morph from it.
      this.stop()
      return
    }
    if (open === wasOpen) return
    if (open) this.startOpen()
    else this.startClose()
  }

  /** Clears everything: animations, observers, the frame and the popup's attribute. */
  stop(): void {
    this.cancelPlacement()
    this.cancelSettle()
    this.cancelAnimations()
    this.pending = null
    this.frame?.removeAttribute(RUNNING_ATTRIBUTE)
    this.tail?.removeAttribute(RUNNING_ATTRIBUTE)
    this.target?.removeAttribute(OUTLINE_MORPH_ATTRIBUTE)
    this.target?.removeAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE)
    this.phase = this.open ? 'open' : 'idle'
  }

  private startOpen(): void {
    const reversing =
      (this.phase === 'closing' || this.phase === 'closed') &&
      (this.frame?.hasAttribute(RUNNING_ATTRIBUTE) ?? false)
    const source = reversing ? (this.source ?? this.pickSource()) : this.pickSource()
    const timing = source ? readTiming(source, this.duration, this.surface) : null
    // A zero open duration (the token set to 0ms, as under reduced motion) is the morph off; so is
    // no trigger to start from (a programmatic open with none attached, or one not rendered).
    if (
      !source ||
      !rendered(source) ||
      !timing ||
      timing.open <= 0 ||
      !canOutlineMorph() ||
      switchedOff(source)
    ) {
      this.stop()
      return
    }
    this.source = source
    this.timing = timing
    const current = reversing ? this.currentBox() : null
    if (current) {
      // Reopened while closing: grow again from where the frame is, for the share left.
      const share = Math.max(this.progress(), MIN_RESUME_SHARE)
      this.cancelSettle()
      this.cancelAnimations()
      this.pending = { from: current, share }
    } else {
      this.stop()
      // The trigger still holds focus here; a popup that takes it does so on a later frame.
      const ring: Ring = ringDrawn(source, this.ring) ? 'drawn' : 'none'
      this.pending = { from: sourceBox(source, ring, this.resolveLength), share: 1, ring }
      // Held unpainted until it is placed and the morph starts (a reversal is already on screen).
      this.target?.setAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE, '')
    }
    this.phase = 'pending'
    this.placementTries = 0
    this.watchPlacement()
  }

  private startClose(): void {
    const source = this.source ?? this.pickSource()
    const target = this.target
    const container = this.container
    const running = this.phase === 'opening' || this.phase === 'open'
    const timing = source ? readTiming(source, this.duration, this.surface) : null
    if (
      !running ||
      !source ||
      !rendered(source) ||
      !target ||
      !container ||
      !timing ||
      timing.close <= 0 ||
      !canOutlineMorph() ||
      switchedOff(source) ||
      switchedOff(target)
    ) {
      // Never shown by the morph (or motion is now off): the popup closes its own way.
      this.stop()
      return
    }
    this.source = source
    this.timing = timing

    const ring = this.closingRing(source, container)
    const to = sourceBox(source, ring, this.resolveLength)
    let from: Box | null
    let share = 1
    if (this.phase === 'opening') {
      share = Math.max(this.progress(), MIN_RESUME_SHARE)
      from = this.currentBox()
    } else {
      const frame = this.readTargetFrame(target)
      this.targetFrame = frame
      from = landing(
        toRect(target.getBoundingClientRect()),
        frame,
        frame.width ?? to.k ?? this.defaultWeight(target),
        frame.color ?? to.color,
        this.viewport()
      )
    }
    if (!from) {
      // Gone, or a side with no edge that isn't on the viewport's edge: it closes at once.
      this.stop()
      return
    }

    this.phase = 'closing'
    this.run(from, to, { kind: 'source', ring }, this.timing.close * share)
  }

  /**
   * Which ring a close lands on. A field that draws its ring on any focus
   * (`focus-within`) keeps it while focus stays in it. Otherwise focus comes
   * back to the trigger when the popup hides, with a ring if the focus inside
   * the popup shows one (the browser carries it over) or if the popup was
   * closed from the keyboard.
   */
  private closingRing(source: HTMLElement, container: HTMLElement): Ring {
    if (ringDrawn(source, this.ring)) return 'drawn'
    const active = document.activeElement
    // The popup's container holds it (a positioner), or it is the popup's sibling (a modal layer).
    const inPopup =
      active instanceof HTMLElement && (container.contains(active) || (this.target?.contains(active) ?? false))
    if (this.ring === 'focus-within') return inPopup ? 'predicted' : 'none'
    const ringReturns =
      source.matches(':focus-visible') || (inPopup && active.matches(':focus-visible'))
    return ringReturns ? 'predicted' : 'none'
  }

  /**
   * The ring a running close lands on now: drawn once the trigger draws it;
   * the planned one while focus stays in the trigger or the popup (on its
   * way back); none once focus has gone elsewhere (an outside press).
   */
  private liveRing(planned: Ring, source: HTMLElement): Ring {
    if (ringDrawn(source, this.ring)) return 'drawn'
    if (planned === 'none') return 'none'
    if (focusHeld(source, [this.container, this.target])) return 'predicted'
    // Focus has left. A field's ring went with it; a trigger whose popup
    // hands focus back may pass through the body on the way, so only focus
    // landing somewhere else cancels its ring.
    const active = document.activeElement
    if (this.ring === 'focus-within' || (active != null && active !== document.body)) return 'none'
    return planned
  }

  /** Starts a pending open once the popup is placed and laid out. Returns whether it started. */
  private tryStart(): boolean {
    const pending = this.pending
    const target = this.target
    const container = this.container
    if (this.phase !== 'pending' || !pending || !target || !container) return false
    if (container.hidden) return false
    const rect = target.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    // A popup not yet placed is held invisible (Base UI's positioner) at the viewport origin.
    if (getComputedStyle(container).opacity === '0') return false

    this.cancelPlacement()
    target.removeAttribute(OUTLINE_MORPH_PENDING_ATTRIBUTE)
    if (switchedOff(target)) {
      // The popup opts out (its own form, such as a tail, isn't a plain frame): it opens its own way.
      this.stop()
      return true
    }
    // A reversed close keeps the frame read before the popup's border took its face.
    const frame =
      this.targetFrame && target.hasAttribute(OUTLINE_MORPH_ATTRIBUTE)
        ? this.targetFrame
        : this.readTargetFrame(target)
    this.targetFrame = frame
    this.pending = null
    this.phase = 'opening'
    // A press into a field focuses it after the open began: start on the ring it now draws.
    const upgrade = pending.ring === 'none' && this.source != null && ringDrawn(this.source, this.ring)
    const from = upgrade && this.source ? sourceBox(this.source, 'drawn', this.resolveLength) : pending.from
    const to = landing(
      toRect(rect),
      frame,
      frame.width ?? from.k ?? this.defaultWeight(target),
      frame.color ?? from.color,
      this.viewport()
    )
    if (!to) {
      // A side with no edge of its own, not on the viewport's edge: no frame to land on, so it opens at once.
      this.stop()
      return true
    }
    this.run(from, to, { kind: 'target' }, this.timing.open * pending.share, upgrade ? 'drawn' : pending.ring)
    return true
  }

  /**
   * The box fixed elements are laid out in: a modal layer's own box (fixed,
   * inset 0: the viewport less a reserved scrollbar gutter), else the
   * root's client box.
   */
  private viewport(): Rect {
    const container = this.container
    if (container && getComputedStyle(container).position === 'fixed') {
      return toRect(container.getBoundingClientRect())
    }
    const root = document.documentElement
    return { x: 0, y: 0, w: root.clientWidth, h: root.clientHeight }
  }

  /** The system ring's weight, `--fgd-focus-width` (2 px): a frame's weight where neither end has one. */
  private defaultWeight(context: HTMLElement): number {
    return this.resolveLength(getComputedStyle(context).getPropertyValue('--fgd-focus-width'), context) || 2
  }

  private readTargetFrame(target: HTMLElement): TargetFrame {
    const style = getComputedStyle(target)
    const rect = target.getBoundingClientRect()
    // A side counts as an edge only if it paints: a border in the popup's
    // own face (a band's seam) is invisible [D12], so it is no edge.
    const face = style.backgroundColor
    const shown = (side: 'Top' | 'Right' | 'Bottom' | 'Left') => {
      const color = style[`border${side}Color`]
      if (style[`border${side}Style`] === 'none' || alphaOf(color) === 0 || color === face) return 0
      return px(style[`border${side}Width`])
    }
    const sides: TargetFrame['sides'] = [shown('Top'), shown('Right'), shown('Bottom'), shown('Left')]
    const widest = sides.indexOf(Math.max(...sides))
    const colors = [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor]
    const edged = sides[widest] > 0
    return {
      r: usedRadii(style, rect.width, rect.height),
      color: edged ? colors[widest] : null,
      width: edged ? sides[widest] : null,
      sides,
    }
  }

  /** The frame's box now, mid-animation, in viewport coordinates. */
  private currentBox(): Box | null {
    const frame = this.frame
    const container = this.container
    if (!frame || !container || !frame.hasAttribute(RUNNING_ATTRIBUTE)) return null
    const origin = container.getBoundingClientRect()
    const style = getComputedStyle(frame)
    let tx: string
    let ty: string
    if (frameOffsetMode() === 'rounded') {
      tx = style.getPropertyValue(OFFSET_X)
      ty = style.getPropertyValue(OFFSET_Y)
    } else {
      // `translate` serializes as "x y", or "x" when y is 0.
      ;[tx = '0', ty = '0'] = style.translate === 'none' ? [] : style.translate.split(' ')
    }
    const w = px(style.width)
    const h = px(style.height)
    return {
      x: origin.left + px(tx),
      y: origin.top + px(ty),
      w,
      h,
      r: usedRadii(style, w, h),
      color: style.borderTopColor,
      k: px(style.borderTopWidth),
    }
  }

  /** How far the running animation has come (eased, 0–1); 1 when none runs. */
  private progress(): number {
    const progress = this.frameAnimation?.effect?.getComputedTiming().progress
    return typeof progress === 'number' ? progress : 1
  }

  /**
   * Animates the frame and the popup's clip from one box to the other
   * (viewport coordinates, converted to the container's) on one timing.
   * The popup's border takes its face (its attribute) while the frame draws
   * the edge.
   */
  private run(from: Box, to: Box, toward: Toward, duration: number, fromRing?: Ring): void {
    const frame = this.frame
    const target = this.target
    const container = this.container
    if (!frame || !target || !container) {
      this.stop()
      return
    }
    this.cancelAnimations()

    const origin = container.getBoundingClientRect()
    const local = <T extends Rect>(box: T): T => ({
      ...box,
      x: box.x - origin.left,
      y: box.y - origin.top,
    })
    // Each end's weight; an end with none of its own (a fill, a sheet with no edge) takes the other's.
    const fallback = this.targetFrame?.width ?? this.defaultWeight(target)
    const fromK = from.k ?? to.k ?? fallback
    const toK = to.k ?? from.k ?? fallback
    const flight: Flight = {
      from: local(from),
      to: local(to),
      toward,
      target: local(toRect(target.getBoundingClientRect())),
      fromK,
      toK,
      fromRing,
      sourceAt:
        fromRing !== undefined && this.source ? local(toRect(this.source.getBoundingClientRect())) : undefined,
    }
    this.flight = flight

    const timing: KeyframeAnimationOptions = {
      duration: Math.max(0, Math.round(duration)),
      easing: this.timing.ease,
      fill: 'both',
    }
    target.setAttribute(OUTLINE_MORPH_ATTRIBUTE, '')
    frame.setAttribute(RUNNING_ATTRIBUTE, '')
    const frameAnimation = frame.animate(frameKeyframes(flight), timing)
    const targetAnimation = target.animate(clipKeyframes(flight), timing)
    // One start time for both: a clip the compositor runs can start a frame
    // after the frame's box and trail it by that frame. Both paint their
    // first keyframe first (the ring, the popup's frame, or where a reversed
    // morph turns, which is what is already on screen), then the clip takes
    // the box's start time.
    frameAnimation.ready.then(
      () => {
        if (this.targetAnimation === targetAnimation && frameAnimation.startTime != null) {
          targetAnimation.startTime = frameAnimation.startTime
        }
      },
      () => {}
    )
    this.frameAnimation = frameAnimation
    this.targetAnimation = targetAnimation
    this.startTail(flight, timing, frameAnimation)
    this.track()

    frameAnimation.finished.then(
      () => {
        if (this.frameAnimation !== frameAnimation) return
        this.cancelTrack()
        if (this.phase === 'opening') this.handOff()
        else if (this.phase === 'closing') this.landClose()
      },
      () => {}
    )
  }

  /**
   * Re-measures the end the morph travels to every frame while it runs; if
   * it moved (a scroll, a resize, the popup settling its size) or a close's
   * ring changed (focus came back, or left), both animations take new
   * keyframes at their current time.
   */
  private track(): void {
    this.cancelTrack()
    const step = () => {
      this.trackFrame = 0
      const flight = this.flight
      const source = this.source
      const target = this.target
      const container = this.container
      if (!flight || !source || !target || !container || !this.frameAnimation) return
      const origin = container.getBoundingClientRect()
      const targetRect = toRect(target.getBoundingClientRect())
      const localTarget = {
        ...targetRect,
        x: targetRect.x - origin.left,
        y: targetRect.y - origin.top,
      }
      let changed = drifted(localTarget, flight.target)
      if (flight.toward.kind === 'target') {
        if (changed && this.targetFrame) {
          // The popup moved or resized (a sheet's bleed follows its box).
          const end = landing(targetRect, this.targetFrame, flight.toK, flight.to.color, this.viewport())
          if (end) flight.to = { ...flight.to, ...end, x: end.x - origin.left, y: end.y - origin.top }
        }
        // Early re-measure: a trigger that moved against the container in
        // the first frames (the page shifting under a scroll lock) moves the
        // start with it, before much of the path is painted.
        if (flight.sourceAt && this.progress() < EARLY_PROGRESS) {
          const now = toRect(source.getBoundingClientRect())
          const at = { ...now, x: now.x - origin.left, y: now.y - origin.top }
          if (drifted(at, flight.sourceAt)) {
            const was = flight.sourceAt
            flight.from = {
              ...flight.from,
              x: flight.from.x + at.x - was.x,
              y: flight.from.y + at.y - was.y,
              w: flight.from.w + at.w - was.w,
              h: flight.from.h + at.h - was.h,
            }
            flight.sourceAt = at
            changed = true
          }
        }
        // A field pressed open takes focus just after the open began (the
        // press's default action): in the first frames, move the start
        // onto the ring it now draws, before much of the path is painted.
        if (flight.fromRing === 'none' && this.progress() < EARLY_PROGRESS && ringDrawn(source, this.ring)) {
          const start = sourceBox(source, 'drawn', this.resolveLength)
          flight.from = { ...start, x: start.x - origin.left, y: start.y - origin.top }
          flight.fromK = start.k ?? flight.fromK
          flight.fromRing = 'drawn'
          changed = true
        }
      } else {
        const ring = this.liveRing(flight.toward.ring, source)
        const end = sourceBox(source, ring, this.resolveLength)
        const localEnd = { ...end, x: end.x - origin.left, y: end.y - origin.top }
        if (ring !== flight.toward.ring) {
          // Focus came back with its ring, or left: land on what the trigger shows now.
          flight.toward = { kind: 'source', ring }
          flight.to = localEnd
          flight.toK = localEnd.k ?? flight.toK
          changed = true
        } else if (drifted(localEnd, flight.to)) {
          flight.to = { ...flight.to, x: localEnd.x, y: localEnd.y, w: localEnd.w, h: localEnd.h }
          changed = true
        }
      }
      // The tail moves with its popup (a flip, a shift): re-read it too.
      const tailFlight = this.tailAnimation ? this.readTail(origin) : null
      const tailMoved =
        tailFlight != null &&
        this.tailFlight != null &&
        (Math.abs(tailFlight.cx - this.tailFlight.cx) > DRIFT_PX ||
          Math.abs(tailFlight.cy - this.tailFlight.cy) > DRIFT_PX ||
          tailFlight.side !== this.tailFlight.side)
      if (changed) {
        flight.target = localTarget
        ;(this.frameAnimation.effect as KeyframeEffect | null)?.setKeyframes(frameKeyframes(flight))
        ;(this.targetAnimation?.effect as KeyframeEffect | null)?.setKeyframes(clipKeyframes(flight))
      }
      if (tailFlight && (changed || tailMoved)) {
        this.placeTail(tailFlight)
        ;(this.tailAnimation?.effect as KeyframeEffect | null)?.setKeyframes(
          tailKeyframes(tailFlight, flight)
        )
      }
      this.trackFrame = requestAnimationFrame(step)
    }
    this.trackFrame = requestAnimationFrame(step)
  }

  /**
   * The open lands: in one task the popup's clip and attribute go (its own
   * border shows) and the frame hides, so nothing changes on screen.
   */
  private handOff(): void {
    this.cancelAnimations()
    this.target?.removeAttribute(OUTLINE_MORPH_ATTRIBUTE)
    this.frame?.removeAttribute(RUNNING_ATTRIBUTE)
    // The popup's own tail shows again on the pixels the cap held.
    this.tail?.removeAttribute(RUNNING_ATTRIBUTE)
    this.phase = 'open'
  }

  /**
   * The popup's own tail as the cap copies it, in the container's
   * coordinates, or null (no tail, or not laid out). Its box is exact for
   * the quarter turns a tail takes. The edge it sits on is read from where
   * it lies against the popup (so logical sides need no direction rule).
   */
  private readTail(origin: DOMRect): TailFlight | null {
    const source = this.tailSource
    const target = this.target
    if (!source || !target || !source.isConnected || !target.contains(source)) return null
    const w = source.offsetWidth
    const h = source.offsetHeight
    if (w === 0 || h === 0) return null
    const rect = source.getBoundingClientRect()
    const popup = target.getBoundingClientRect()
    const side = source.getAttribute('data-side') ?? 'bottom'
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const normal: TailNormal =
      cy <= popup.top ? 'up' : cy >= popup.bottom ? 'down' : cx <= popup.left ? 'left' : 'right'
    return {
      cx: cx - origin.left,
      cy: cy - origin.top,
      w,
      h,
      d: h,
      normal,
      side,
    }
  }

  /**
   * Places the cap on the tail (custom properties only), in whole pixels
   * from the container's corner: the tail's box is laid out, so it paints
   * snapped to the pixel grid, and a fractional translation would paint the
   * cap's stroke softer than the tail it hands off to.
   */
  private placeTail(tail: TailFlight): void {
    const cap = this.tail
    if (!cap) return
    cap.style.setProperty(TAIL_X, `${Math.round(tail.cx - tail.w / 2)}px`)
    cap.style.setProperty(TAIL_Y, `${Math.round(tail.cy - tail.h / 2)}px`)
    cap.setAttribute('data-side', tail.side)
    this.tailFlight = tail
  }

  /**
   * The tail cap: a copy of the popup's tail above the frame, shown only on
   * the trigger side of the frame's trigger-facing inner edge, so it grows
   * out of that edge as the frame arrives, tip first and always attached,
   * and is whole exactly as the frame lands; a close retracts it into the
   * edge. Its stroke takes the frame's color on the same timing, its face
   * the popup's. Nothing fades.
   */
  private startTail(flight: Flight, timing: KeyframeAnimationOptions, frameAnimation: Animation): void {
    const cap = this.tail
    const target = this.target
    const container = this.container
    if (!cap || !target || !container) return
    const tail = this.readTail(container.getBoundingClientRect())
    if (!tail) {
      cap.removeAttribute(RUNNING_ATTRIBUTE)
      return
    }
    this.placeTail(tail)
    cap.style.setProperty(TAIL_FILL, getComputedStyle(target).backgroundColor)
    cap.setAttribute(RUNNING_ATTRIBUTE, '')
    const tailAnimation = cap.animate(tailKeyframes(tail, flight), timing)
    frameAnimation.ready.then(
      () => {
        if (this.tailAnimation === tailAnimation && frameAnimation.startTime != null) {
          tailAnimation.startTime = frameAnimation.startTime
        }
      },
      () => {}
    )
    this.tailAnimation = tailAnimation
  }

  /**
   * The close lands on the trigger. The frame and the popup's clip hold
   * their end state until the popup's container hides, which takes the
   * frame with it in the frame focus returns (so the ring shows at once);
   * then everything clears. A container that never hides clears after
   * SETTLE_MS.
   */
  private landClose(): void {
    this.phase = 'closed'
    const container = this.container
    const settle = () => {
      if (this.phase === 'closed') this.stop()
    }
    if (!container || container.hidden || !container.isConnected) {
      settle()
      return
    }
    this.cancelSettle()
    this.settleObserver = new MutationObserver(() => {
      if (container.hidden || !container.isConnected) settle()
    })
    this.settleObserver.observe(container, { attributes: true, attributeFilter: ['hidden', 'style'] })
    this.settleTimer = setTimeout(settle, SETTLE_MS)
  }

  /** While an open waits for the popup's placement: try now, then watch its container and the popup, and poll a few frames. */
  private watchPlacement(): void {
    if (this.phase !== 'pending' || this.tryStart()) return
    const container = this.container
    const target = this.target
    this.placementObserver?.disconnect()
    this.placementObserver = null
    if (container && target) {
      this.placementObserver = new MutationObserver(() => {
        this.tryStart()
      })
      this.placementObserver.observe(container, { attributes: true, attributeFilter: ['style', 'hidden'] })
      this.placementObserver.observe(target, { attributes: true })
    }
    if (this.placementFrame) return
    const poll = () => {
      this.placementFrame = 0
      if (this.phase !== 'pending' || this.tryStart()) return
      this.placementTries += 1
      if (this.placementTries >= PLACEMENT_FRAMES) {
        // Never placed in time: the popup opens its own way.
        this.stop()
        return
      }
      this.placementFrame = requestAnimationFrame(poll)
    }
    this.placementFrame = requestAnimationFrame(poll)
  }

  private cancelPlacement(): void {
    this.placementObserver?.disconnect()
    this.placementObserver = null
    if (this.placementFrame) cancelAnimationFrame(this.placementFrame)
    this.placementFrame = 0
  }

  private cancelTrack(): void {
    if (this.trackFrame) cancelAnimationFrame(this.trackFrame)
    this.trackFrame = 0
  }

  private cancelSettle(): void {
    this.settleObserver?.disconnect()
    this.settleObserver = null
    if (this.settleTimer !== undefined) clearTimeout(this.settleTimer)
    this.settleTimer = undefined
  }

  private cancelAnimations(): void {
    this.cancelTrack()
    this.frameAnimation?.cancel()
    this.targetAnimation?.cancel()
    this.tailAnimation?.cancel()
    this.frameAnimation = null
    this.targetAnimation = null
    this.tailAnimation = null
    this.tailFlight = null
    this.flight = null
  }
}

/** Radii as a `border-radius` (or `round`) value, drawn in by `inset`. */
function radiiValue(r: Radii, inset = 0): string {
  return r.map((radius) => `${Math.max(0, radius - inset)}px`).join(' ')
}

/**
 * The frame's two keyframes: box, radii, color, one edge weight. The box
 * moves by a translation (never a scale, so the edge keeps its weight),
 * through the rounded offset properties where supported, and resizes by
 * width and height from a fixed start corner, so the frame's travel is
 * never reported as a layout shift.
 */
function frameKeyframes(flight: Flight): Keyframe[] {
  const rounded = frameOffsetMode() === 'rounded'
  const weight = (k: number): Keyframe => (rounded ? { [EDGE_WEIGHT]: `${k}px` } : { borderWidth: `${k}px` })
  const place = (box: Box, k: number): Keyframe => {
    // Each end at the edges the browser paints it with: snapped to whole
    // pixels, the size from the snapped far edges (so a popup 297.5 px tall
    // ends on its own painted frame, not a pixel off).
    const w = Math.round(box.x + box.w) - Math.round(box.x)
    const h = Math.round(box.y + box.h) - Math.round(box.y)
    if (!rounded) {
      return {
        translate: `${box.x}px ${box.y}px`,
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: radiiValue(box.r),
        borderColor: box.color,
        ...weight(k),
      }
    }
    return {
      [OFFSET_X]: `${box.x}px`,
      [OFFSET_Y]: `${box.y}px`,
      [SIZE_W]: `${w}px`,
      [SIZE_H]: `${h}px`,
      [RADII[0]]: `${Math.max(0, box.r[0])}px`,
      [RADII[1]]: `${Math.max(0, box.r[1])}px`,
      [RADII[2]]: `${Math.max(0, box.r[2])}px`,
      [RADII[3]]: `${Math.max(0, box.r[3])}px`,
      [EDGE_COLOR]: box.color,
      ...weight(k),
    }
  }
  const from = place(flight.from, flight.fromK)
  const to = place(flight.to, flight.toK)
  if (flight.fromK === flight.toK) return [from, to]
  // The weight steps once, never tweens (a fractional edge paints soft):
  // two keyframes for the weight alone, at the same offset, on the eased
  // progress the effect's easing produces.
  return [
    { ...from, offset: 0 },
    { ...weight(flight.fromK), offset: WEIGHT_STEP },
    { ...weight(flight.toK), offset: WEIGHT_STEP },
    { ...to, offset: 1 },
  ]
}

/**
 * The box the frame lands on (or leaves from) on the popup: its border box
 * and radii, at edge weight `k` in `color` (the popup's own edge, or, for
 * a popup with no edge at all, the other end's). A side with no edge of its
 * own (a sheet's) that lies on the viewport's edge is met one weight past
 * it, so the frame's edge there is off screen at the hand-off; such a side
 * anywhere else leaves no frame to land on (null: the popup opens and
 * closes at once). `viewport` is the box fixed elements are laid out in.
 */
function landing(rect: Rect, frame: TargetFrame, k: number, color: string, viewport: Rect): Box | null {
  const box: Box = { ...rect, r: frame.r, color, k }
  if (frame.sides.every((side) => side >= k - 0.01)) return box
  const flush = [
    rect.y <= viewport.y + 0.5,
    rect.x + rect.w >= viewport.x + viewport.w - 0.5,
    rect.y + rect.h >= viewport.y + viewport.h - 0.5,
    rect.x <= viewport.x + 0.5,
  ]
  const out = [0, 0, 0, 0]
  for (let side = 0; side < 4; side += 1) {
    if (frame.sides[side] >= k - 0.01) continue
    if (!flush[side]) return null
    out[side] = k
  }
  return {
    ...box,
    x: rect.x - out[3],
    y: rect.y - out[0],
    w: rect.w + out[1] + out[3],
    h: rect.h + out[0] + out[2],
  }
}

/**
 * The popup's two clip keyframes: the frame's box relative to the popup,
 * drawn in by CLIP_INSET_PX (still under the frame's edge), so the frame's
 * whole-pixel rounding never lets the popup show past its outer edge.
 */
function clipKeyframes(flight: Flight): Keyframe[] {
  const t = flight.target
  const d = CLIP_INSET_PX
  const clip = (box: Box): Keyframe => ({
    clipPath: `inset(${box.y - t.y + d}px ${t.x + t.w - (box.x + box.w) + d}px ${
      t.y + t.h - (box.y + box.h) + d
    }px ${box.x - t.x + d}px round ${radiiValue(box.r, d)})`,
  })
  return [clip(flight.from), clip(flight.to)]
}

/**
 * How much of the tail shows (px, from its tip): the distance from its
 * tip-side edge to the frame's trigger-facing inner edge, for the frame box
 * `box` at edge weight `weight`. At or under 0 nothing shows; at `d` (the
 * frame on the popup's edge) all of it.
 */
function tailDepth(tail: TailFlight, box: Box, weight: number): number {
  switch (tail.normal) {
    case 'up':
      return box.y + weight - (tail.cy - tail.d / 2)
    case 'down':
      return tail.cy + tail.d / 2 - (box.y + box.h - weight)
    case 'left':
      return box.x + weight - (tail.cx - tail.d / 2)
    case 'right':
      return tail.cx + tail.d / 2 - (box.x + box.w - weight)
  }
}

/**
 * The cap's clip, in its own unrotated box (the tip at the local top, the
 * base at the local bottom whatever the side, since the rotation applies
 * after the clip): the moving local bottom at the visible depth; the three
 * fixed sides one stroke width outside the box, so the tip's miter is never
 * cut.
 */
function tailClip(tail: TailFlight, depth: number, stroke: number): string {
  // Unclamped above: an inset past the box is an empty shape, and keeping
  // the true value keeps the clip linear with the edge, so it opens exactly
  // when the edge reaches the tip.
  const bottom = Math.max(-stroke, tail.d - depth)
  return `inset(${-stroke}px ${-stroke}px ${bottom}px ${-stroke}px)`
}

/**
 * The cap's two keyframes, on the frame's timing: its clip from the depth
 * at the frame's start box to the depth at its end box (both linear in the
 * eased progress, as the frame's box is, so the clip tracks the edge), and
 * its stroke color (`currentColor`) from the frame's start color to its end
 * color.
 */
function tailKeyframes(tail: TailFlight, flight: Flight): Keyframe[] {
  const stroke = Math.max(flight.fromK, flight.toK)
  return [
    {
      clipPath: tailClip(tail, tailDepth(tail, flight.from, flight.fromK), stroke),
      color: flight.from.color,
    },
    { clipPath: tailClip(tail, tailDepth(tail, flight.to, flight.toK), stroke), color: flight.to.color },
  ]
}
