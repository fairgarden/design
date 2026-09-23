'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useDemo } from '@fairgarden/docs/useDemo'
import { FileTabs } from './CodeContent'
import styles from './code.module.css'
import './syntax.css'

export type DemoContentProps = ContentProps<{
  /**
   * A page-frame demo (Navigation Bar, Section Bar, Footer …) whose parts
   * follow viewport media. It renders in a frame that is its own viewport:
   * the demo's page, staged alone, so the media resolve against the frame's
   * width and the demo never overflows the column. `true`: the frame grows
   * to the demo's height. `'scroll'`: a fixed-height frame the demo scrolls
   * inside, so sticky bars dock and follow the section in view.
   */
  frame?: boolean | 'scroll'
}>

/** The message a staged demo posts to its frame with its content height. */
const STAGE_MESSAGE = 'fairgarden-demo-stage'
/** The frame's request for that message, when it mounts after the stage did. */
const STAGE_REQUEST = 'fairgarden-demo-stage-request'

/** The demo's own route (`/components/<name>/demos/<demo>`), read from its `index.ts` URL. */
function demoRoute(url: string | undefined) {
  return url?.match(/\/app(\/(?:components|overview)\/.+?)\/index\.[cm]?[jt]sx?$/)?.[1]
}

const subscribeNever = () => () => {}

/** Whether this render is the demo's own page opened as a stage (`?stage`). */
function useStaged(route: string | undefined) {
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
function Stage({ children }: { children: React.ReactNode }) {
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
      className={scroll ? `${styles.frame} ${styles.frameScroll}` : styles.frame}
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
 * A live demo: the rendered component above its source. The component
 * renders inline (no iframe), inside the page's own ground scope; a
 * `frame` demo renders its own page in a frame instead, with a link to
 * that page at full width.
 */
export function DemoContent(props: DemoContentProps) {
  // Always pass props straight through (useDemo reads the precomputed data).
  const demo = useDemo(props, { preClassName: styles.pre })
  const route = demoRoute(props.url)
  const staged = useStaged(route)

  if (staged) return <Stage>{demo.component}</Stage>

  const framed = props.frame != null && props.frame !== false && route != null
  const stageHref = `${route}?stage`

  return (
    <div className={styles.root}>
      {demo.allFilesSlugs.map(({ slug }) => (
        <span key={slug} id={slug} />
      ))}
      {framed ? (
        <div className={styles.previewFramed}>
          <DemoFrame
            src={stageHref}
            title={`${demo.name ?? 'Demo'}: live demo`}
            scroll={props.frame === 'scroll'}
          />
        </div>
      ) : (
        <div className={styles.preview}>{demo.component}</div>
      )}
      <div className={styles.toolbar}>
        <FileTabs
          files={demo.files}
          selected={demo.selectedFileName}
          onSelect={demo.selectFileName}
        />
        {framed ? (
          <a className={styles.open} href={stageHref}>
            Full page
          </a>
        ) : null}
        <button type="button" className={styles.copy} onClick={demo.copy}>
          Copy
        </button>
      </div>
      {demo.selectedFile}
    </div>
  )
}
