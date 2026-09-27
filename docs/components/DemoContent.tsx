'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { DemoLazy } from '@fairgarden/design/content/demo/DemoLazy'
import type { DemoOptions } from '@fairgarden/design/content/demo/DemoContent'
import { framedPreview, type DemoFrameOption } from './FramedPreview'

export type SiteDemoOptions = DemoOptions & {
  /** A page-frame demo: see `DemoFrameOption`. */
  frame?: DemoFrameOption
}

export type DemoContentProps = ContentProps<SiteDemoOptions>

/**
 * The site's demo content: the design system's Demo, code-split
 * (`DemoLazy`). A `frame` demo renders its preview route in a frame,
 * passed in as `renderPreview`.
 */
export function DemoContent(props: DemoContentProps) {
  const { frame, ...contentProps } = props
  return <DemoLazy {...contentProps} renderPreview={framedPreview(frame, props.url, props.name)} />
}
