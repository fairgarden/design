'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@fairgarden/design/data/table'

const allergens = ['Gluten', 'Dairy', 'Egg', 'Soy', 'Peanut', 'Tree nut', 'Sesame'] as const

/** ● contains, ○ may contain, empty: does not contain. */
const menu: ReadonlyArray<readonly [string, ReadonlyArray<'●' | '○' | ''>]> = [
  ['Garden burger', ['●', '', '○', '●', '', '', '●']],
  ['Harvest bowl', ['', '', '', '●', '', '○', '●']],
  ['Field greens', ['', '●', '', '', '', '●', '']],
  ['Oat crumble', ['●', '●', '●', '', '○', '●', '']],
]

/** A matrix: the full grid, the first column pinned while the rest scrolls. */
export function TableMatrix() {
  return (
    <Table
      strategy="scroll"
      grid
      scrollCue="Scroll for more allergens →"
      notes={<p>● Contains. ○ May contain traces. An empty cell: does not contain.</p>}
    >
      <TableCaption label="Table 3">Allergens by dish</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Dish</TableHeaderCell>
          {allergens.map((allergen) => (
            <TableHeaderCell key={allergen}>{allergen}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {menu.map(([dish, marks]) => (
          <TableRow key={dish}>
            <TableHeaderCell>{dish}</TableHeaderCell>
            {marks.map((mark, index) => (
              <TableCell key={allergens[index]}>{mark}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
