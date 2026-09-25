'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@fairgarden/design/actions/link'
import styles from './demo.module.css'

/*
 * The site's demo modes around the design system's Demo, shared by the
 * demo content (DemoContent) and its loading state (DemoLoading): the
 * staged page (`?stage`) and the page-frame preview, an iframe of that
 * staged page.
 */

/**
 * A page-frame demo (Navigation Bar, Section Bar, Footer …) whose parts
 * follow viewport media. It renders in a frame that is its own viewport:
 * the demo's page, staged alone, so the media resolve against the frame's
 * width and the demo never overflows the column. `true`: the frame grows
 * to the demo's height. `'scroll'`: a fixed-height frame the demo scrolls
 * inside, so sticky bars dock and follow the section in view.
 */
export type DemoFrameOption = boolean | 'scroll'

/** The message a staged demo posts to its frame with its content height. */
const STAGE_MESSAGE = 'fairgarden-demo-stage'
/** The frame's request for that message, when it mounts after the stage did. */
const STAGE_REQUEST = 'fairgarden-demo-stage-request'

/** The demo's own route (`/<section>/<name>/demos/<demo>`), read from its `index.ts` URL. */
export function demoRoute(url: string | undefined) {
  return url?.match(/\/app(\/[^/]+\/.+?\/demos\/[^/]+)\/index\.[cm]?[jt]sx?$/)?.[1]
}

const subscribeNever = () => () => {}

/** Whether this render is the demo's own page opened as a stage (`?stage`). */
export function useStaged(route: string | undefined) {
  const pathname = usePathname()
  const staged = React.useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).has('stage'),
    () => false
  )
  return staged && route != null && pathname === route
}

/**
 * The staged demo: the component alone on the page ground, at the top of
 * the page and full width; the docs chrome stays laid out but hidden. In a
 * frame it follows the parent page's mode and reports its height.
 */
export function Stage({ children }: { children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const content = contentRef.current
    if (content == null || window.parent === window) return undefined

    let parentRoot: HTMLElement
    try {
      parentRoot = window.parent.document.documentElement
    } catch {
      return undefined
    }
    const root = document.documentElement
    const syncTheme = () => {
      const theme = parentRoot.getAttribute('data-theme')
      if (theme == null) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', theme)
    }
    const postHeight = () => {
      window.parent.postMessage(
        { type: STAGE_MESSAGE, height: Math.ceil(content.getBoundingClientRect().height) },
        window.location.origin
      )
    }

    const onRequest = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === STAGE_REQUEST) postHeight()
    }

    syncTheme()
    postHeight()
    window.addEventListener('message', onRequest)
    const themeObserver = new MutationObserver(syncTheme)
    themeObserver.observe(parentRoot, { attributes: true, attributeFilter: ['data-theme'] })
    const sizeObserver = new ResizeObserver(postHeight)
    sizeObserver.observe(content)
    return () => {
      window.removeEventListener('message', onRequest)
      themeObserver.disconnect()
      sizeObserver.disconnect()
    }
  }, [])

  return (
    <div className={styles.stage}>
      <div ref={contentRef}>{children}</div>
    </div>
  )
}

/** The frame's box: `--frame-block-size` once its page reports a height, a fixed viewport with `scroll`. */
function frameClassName(scroll: boolean) {
  return scroll ? `${styles.frame} ${styles.frameScroll}` : styles.frame
}

/** The frame: the demo's staged page, sized to its content (fixed with `scroll`). */
function DemoFrame({ src, title, scroll }: { src: string; title: string; scroll: boolean }) {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = React.useState<number>()

  // A stage that mounted first has already posted; ask it again.
  const requestHeight = React.useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: STAGE_REQUEST }, window.location.origin)
  }, [])

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== STAGE_MESSAGE ||
        typeof event.data.height !== 'number'
      ) {
        return
      }
      setHeight(event.data.height)
    }
    window.addEventListener('message', onMessage)
    requestHeight()
    return () => window.removeEventListener('message', onMessage)
  }, [requestHeight])

  return (
    <iframe
      ref={frameRef}
      onLoad={requestHeight}
      src={src}
      title={title}
      loading="lazy"
      className={frameClassName(scroll)}
      data-ready={height != null ? '' : undefined}
      style={
        height != null && !scroll
          ? ({ '--frame-block-size': `${height}px` } as React.CSSProperties)
          : undefined
      }
    />
  )
}

/**
 * The page-frame preview: the frame, edge to edge in the demo's preview
 * (it cancels the preview's inset), with a "Full page" link to the staged
 * page at the browser's width. With `placeholder`, an empty box the size
 * of the frame before its page reports a height stands in for it: the
 * loading state renders that, so the frame's page loads once, in the
 * loaded demo (the lazy swap replaces the loading state's tree, and a
 * frame that remounts loads its page again).
 */
export function FramedPreview({
  route,
  name,
  scroll,
  placeholder = false,
}: {
  route: string
  name: string | undefined
  scroll: boolean
  placeholder?: boolean
}) {
  const stageHref = `${route}?stage`
  return (
    <div className={styles.framed}>
      {placeholder ? (
        <div className={frameClassName(scroll)} />
      ) : (
        <DemoFrame src={stageHref} title={`${name ?? 'Demo'}: live demo`} scroll={scroll} />
      )}
      <div className={styles.frameFoot}>
        <Link kind="standalone" href={stageHref}>
          Full page
        </Link>
      </div>
    </div>
  )
}

/**
 * The preview renderer for a demo's `frame` option (the Demo's
 * `renderPreview`): the page-frame preview when the demo is framed (it
 * needs its own route), else none. The loading state passes `placeholder`
 * (see `FramedPreview`).
 */
export function framedPreview(
  frame: DemoFrameOption | undefined,
  route: string | undefined,
  name: string | undefined,
  { placeholder = false }: { placeholder?: boolean } = {}
) {
  if (frame == null || frame === false || route == null) return undefined
  const preview = (
    <FramedPreview route={route} name={name} scroll={frame === 'scroll'} placeholder={placeholder} />
  )
  return function renderFramedPreview() {
    return preview
  }
}
