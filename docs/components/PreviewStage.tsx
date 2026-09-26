'use client'

import * as React from 'react'
import { Ground } from '@fairgarden/design/foundations/ground'
import { PREVIEW_HEIGHT, PREVIEW_HEIGHT_REQUEST } from './previewMessages'
import styles from './preview.module.css'

/**
 * A preview route's page (app/preview): the component alone on the paper
 * page ground, full width and at least a viewport tall, with no docs
 * chrome. Opened on its own it is the demo's full page. In a page frame
 * (the iframe on its docs page) it follows the parent page's mode and
 * posts the height the frame needs: its content and the band's seams.
 */
export function PreviewStage({ children }: { children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const content = contentRef.current
    const page = content?.parentElement
    if (content == null || page == null || window.parent === window) return undefined

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
      const seams = page.offsetHeight - page.clientHeight
      window.parent.postMessage(
        {
          type: PREVIEW_HEIGHT,
          height: Math.ceil(content.getBoundingClientRect().height + seams),
        },
        window.location.origin
      )
    }
    const onRequest = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === PREVIEW_HEIGHT_REQUEST) {
        postHeight()
      }
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
    <Ground preset="paper" kind="band" render={<div className={styles.page} />}>
      <div ref={contentRef}>{children}</div>
    </Ground>
  )
}
