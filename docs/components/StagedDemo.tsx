'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useDemo } from '@fairgarden/docs/useDemo'
import type { DemoOptions } from '@fairgarden/design/content/demo/DemoContent'
import { Stage } from './DemoStage'

/** The staged page (`?stage`): the engine's selected variant, alone. */
export default function StagedDemo(props: ContentProps<DemoOptions>) {
  const demo = useDemo(props)
  return <Stage>{demo.component}</Stage>
}
