import { SpecGrid, SpecGridItem } from '@fairgarden-private/design/components/SpecGrid'

/** An "At a glance" sheet: rule-topped cells, 1 to 4 columns by the grid's own width. */
export function SpecGridGlance() {
  return (
    <SpecGrid label="At a glance">
      <SpecGridItem label="Length">28–34 cm (11–13 in)</SpecGridItem>
      <SpecGridItem label="Wingspan" estimated>
        55 cm (22 in)
      </SpecGridItem>
      <SpecGridItem label="Weight">70–90 g (2.5–3.2 oz)</SpecGridItem>
      <SpecGridItem label="Habitat">Wet meadows, marsh edges and slow streams</SpecGridItem>
      <SpecGridItem label="Diet">Insects in summer; seeds and berries in winter</SpecGridItem>
      <SpecGridItem label="Nesting">Cup nest in reeds, 1–2 m above water</SpecGridItem>
      <SpecGridItem label="Range">Eastern North America, north to Ontario</SpecGridItem>
      <SpecGridItem label="Status">Least concern</SpecGridItem>
    </SpecGrid>
  )
}
