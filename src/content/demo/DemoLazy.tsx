'use client'

import * as React from 'react'
import { LazyContent } from '@fairgarden/docs/CoordinatedLazy'

import type { DemoContentProps } from './DemoContent'

/**
 * Demo, code-split: the demo factories' `DemoContent` that loads
 * DemoContent (`useDemo`, the code section, the Select) in its own chunk,
 * as fg-docs' DemoContentLazy. Pair it with `DemoContentLoading:
 * DemoLoading`, which shows while the chunk loads. Props, `renderPreview`
 * included, pass through to DemoContent.
 */
export function DemoLazy(props: DemoContentProps) {
  return (
    <LazyContent<DemoContentProps>
      content={() => import('./DemoContent').then((mod) => ({ default: mod.DemoContent }))}
      props={props}
    />
  )
}
