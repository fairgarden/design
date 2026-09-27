'use client'

import * as React from 'react'
import { Link } from '@fairgarden/design/actions/link'
import { PREVIEW_HEIGHT, PREVIEW_HEIGHT_REQUEST } from './previewMessages'
import styles from './demo.module.css'

/*
 * The site's page-frame preview around the design system's Demo, shared by
 * the demo content (DemoContent) and its loading state (DemoLoading): an
 * iframe of the demo's preview route, the component alone on a page of its
 * own outside the docs layout (`app/preview`, PreviewStage).
 */

/**
 * A page-frame demo (Navigation Bar, Section Bar, Footer …) whose parts
 * follow viewport media. It renders in a frame that is its own viewport:
 * the demo's preview route, so the media resolve against the frame's width
 * and the demo never overflows the column. `true`: the frame grows to the
 * demo's height. `'scroll'`: a fixed-height frame the demo scrolls inside,
 * so sticky bars dock and follow the section in view. The demo needs its
 * preview page, `app/preview/<docs path>/demos/<name>/page.tsx`.
 */
export type DemoFrameOption = boolean | 'scroll'

/**
 * The demo's preview route, read from its `index.ts` URL: its docs path
 * (`/<section>/<name>/demos/<demo>`, without route groups) under
 * `/preview`.
 */
export function previewRoute(url: string | undefined) {
  const route = url && decodeURI(url).match(/^.*\/app(\/.+\/demos\/[^/]+)\/index\.[cm]?[jt]sx?$/)?.[1]
  return route ? `/preview${route.replace(/\/\([^/)]+\)/g, '')}` : undefined
}

/** The frame's box: `--frame-block-size` once its page reports a height, a fixed viewport with `scroll`. */
function frameClassName(scroll: boolean) {
  return scroll ? `${styles.frame} ${styles.frameScroll}` : styles.frame
}

/** The frame: the demo's preview route, sized to its content (fixed with `scroll`). */
function DemoFrame({ src, title, scroll }: { src: string; title: string; scroll: boolean }) {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = React.useState<number>()

  // A preview that mounted first has already posted; ask it again.
  const requestHeight = React.useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_HEIGHT_REQUEST },
      window.location.origin
    )
  }, [])

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== PREVIEW_HEIGHT ||
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
 * (it cancels the preview's inset), with a "Full page" link to the preview
 * route at the browser's width. With `placeholder`, an empty box the size
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
  return (
    <div className={styles.framed}>
      {placeholder ? (
        <div className={frameClassName(scroll)} />
      ) : (
        <DemoFrame src={route} title={`${name ?? 'Demo'}: live demo`} scroll={scroll} />
      )}
      <div className={styles.frameFoot}>
        <Link kind="standalone" href={route}>
          Full page
        </Link>
      </div>
    </div>
  )
}

/**
 * The preview renderer for a demo's `frame` option (the Demo's
 * `renderPreview`): the page-frame preview of the demo's preview route when
 * the demo is framed, else none. The loading state passes `placeholder`
 * (see `FramedPreview`).
 */
export function framedPreview(
  frame: DemoFrameOption | undefined,
  url: string | undefined,
  name: string | undefined,
  { placeholder = false }: { placeholder?: boolean } = {}
) {
  const route = previewRoute(url)
  if (frame == null || frame === false || route == null) return undefined
  const preview = (
    <FramedPreview route={route} name={name} scroll={frame === 'scroll'} placeholder={placeholder} />
  )
  return function renderFramedPreview() {
    return preview
  }
}
