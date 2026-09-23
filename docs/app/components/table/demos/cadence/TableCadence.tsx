'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@fairgarden-private/design/components/Table'

const counts = [
  ['January', 412, 38],
  ['February', 388, 35],
  ['March', 540, 44],
  ['April', 716, 61],
  ['May', 902, 73],
  ['June', 874, 70],
  ['July', 655, 58],
  ['August', 610, 54],
  ['September', 781, 66],
  ['October', 693, 59],
  ['November', 470, 41],
  ['December', 395, 36],
] as const

const number = new Intl.NumberFormat('en-US')

/**
 * Twelve body rows switch to the five-row cadence: dotted rules between
 * rows, a solid rule after every fifth. One row is selected (the row bar);
 * one is inactive, with a word.
 */
export function TableCadence() {
  return (
    <Table strategy="fit">
      <TableCaption label="Table 2" note="Counts from the weekly marsh walk.">
        Birds counted per month, 2025
      </TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Month</TableHeaderCell>
          <TableHeaderCell numeric>Birds</TableHeaderCell>
          <TableHeaderCell numeric>Species</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {counts.map(([month, birds, species]) => (
          <TableRow key={month} selected={month === 'May'} inactive={month === 'December'}>
            <TableHeaderCell>{month === 'December' ? 'December (partial)' : month}</TableHeaderCell>
            <TableCell numeric>{number.format(birds)}</TableCell>
            <TableCell numeric>{species}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
