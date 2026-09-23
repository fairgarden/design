import * as React from 'react'
import { Ground } from '@fairgarden-private/design/components/Ground'
import type {
  FieldPreset,
  GroundPreset,
} from '@fairgarden-private/design/components/Ground'

/*
 * Demo helper: renders a preset sample in the kind that preset belongs to
 * [D178]: a field preset as `kind="field"`, `night` as its band, and a page
 * ground as a `kind="face"` panel. Demos that compare one component across
 * grounds map over a preset list with it. The field list is restated here,
 * not imported, so server-rendered demos never call into the client module.
 */

const fields: ReadonlySet<GroundPreset> = new Set<FieldPreset>([
  'forest',
  'leaf',
  'amber',
  'clay',
  'pink',
  'royal',
  'brick',
])

function isField(preset: GroundPreset): preset is FieldPreset {
  return fields.has(preset)
}

/** Props for PresetGround: Ground's shared props, and any v1 preset. */
export type PresetGroundProps = Omit<
  React.ComponentProps<typeof Ground>,
  'kind' | 'preset' | 'framed' | 'onMedia'
> & {
  preset: GroundPreset
}

export function PresetGround({ preset, ...rest }: PresetGroundProps) {
  if (isField(preset)) return <Ground {...rest} kind="field" preset={preset} />
  if (preset === 'night') return <Ground {...rest} kind="band" preset="night" />
  return <Ground {...rest} kind="face" preset={preset} />
}
