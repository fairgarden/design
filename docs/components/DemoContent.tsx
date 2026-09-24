'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { DemoLazy } from '@fairgarden/design/content/demo/DemoLazy'
import type { DemoOptions } from '@fairgarden/design/content/demo/DemoContent'
import { demoRoute, framedPreview, Stage, useStaged, type DemoFrameOption } from './DemoStage'

export type SiteDemoOptions = DemoOptions & {
  /** A page-frame demo: see `DemoFrameOption`. */
  frame?: DemoFrameOption
}

export type DemoContentProps = ContentProps<SiteDemoOptions>

// The staged page needs the engine's variant selection; it loads only there.
const StagedDemo = React.lazy(() => import('./StagedDemo'))

/**
 * The site's demo content: the design system's Demo, code-split
 * (`DemoLazy`), with the site's two page modes around it. A `frame` demo
 * renders its own page in a frame, passed in as `renderPreview`; opened as
 * a stage (`?stage`), the demo renders alone.
 */
export function DemoContent(props: DemoContentProps) {
  const { frame, ...contentProps } = props
  const route = demoRoute(props.url)
  const staged = useStaged(route)

  if (staged) {
    // Until the engine loads, the demo's first variant stands in.
    const first = Object.values(props.components ?? {})[0]
    return (
      <React.Suspense fallback={<Stage>{first}</Stage>}>
        <StagedDemo {...contentProps} />
      </React.Suspense>
    )
  }

  return <DemoLazy {...contentProps} renderPreview={framedPreview(frame, route, props.name)} />
}
