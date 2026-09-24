'use client'

import * as React from 'react'
import type { ContentLoadingProps } from '@fairgarden/docs/CodeHighlighter/types'
import { DemoLoading as DesignDemoLoading } from '@fairgarden/design/content/demo/DemoLoading'
import type { SiteDemoOptions } from './DemoContent'
import { demoRoute, framedPreview, Stage, useStaged } from './DemoStage'

/**
 * The site's demo loading state: the design system's DemoLoading, with the
 * page modes. A framed demo shows a stand-in the frame's size, not the
 * frame: the swap replaces this tree, and a frame that remounts would load
 * its page again, so it loads once, in the loaded demo.
 */
export function DemoLoading(props: ContentLoadingProps<SiteDemoOptions>) {
  const { frame, ...fallback } = props
  const route = demoRoute(props.url)
  const staged = useStaged(route)

  if (staged) return <Stage>{props.component}</Stage>

  return (
    <DesignDemoLoading
      {...fallback}
      renderPreview={framedPreview(frame, route, props.name, { placeholder: true })}
    />
  )
}
