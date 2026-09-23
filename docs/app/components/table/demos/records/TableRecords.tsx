'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSort,
} from '@fairgarden-private/design/components/Table'

interface Trail {
  name: string
  region: string
  length: number
  gain: number | null
}

const trails: readonly Trail[] = [
  { name: 'Cedar Loop', region: 'North Ridge', length: 4.2, gain: 120 },
  { name: 'Heron Marsh Boardwalk', region: 'Lowlands', length: 1.6, gain: 0 },
  { name: 'Old Quarry Climb', region: 'North Ridge', length: 7.9, gain: 410 },
  { name: 'Meadow Link', region: 'Valley', length: 3.1, gain: null },
  { name: 'Prairie Overlook', region: 'Valley', length: 5.4, gain: 180 },
]

const number = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

type Column = 'name' | 'length'

/** Records stack below 768 px of the table; the name and length headers sort. */
export function TableRecords() {
  const [sort, setSort] = React.useState<{ column: Column; direction: TableSort }>({
    column: 'name',
    direction: 'ascending',
  })

  const rows = [...trails].sort((a, b) => {
    const order =
      sort.column === 'name' ? a.name.localeCompare(b.name) : a.length - b.length
    return sort.direction === 'descending' ? -order : order
  })

  const sortBy = (column: Column) => () =>
    setSort((current) => ({
      column,
      direction:
        current.column === column && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))

  const stateOf = (column: Column): TableSort =>
    sort.column === column ? sort.direction : 'none'

  const total = trails.reduce((sum, trail) => sum + trail.length, 0)

  return (
    <Table
      notes={
        <>
          <p>Source: Trail stewardship survey, spring 2026.</p>
          <p>— No measurement yet.</p>
        </>
      }
    >
      <TableCaption label="Table 1" note="Lengths in kilometres; elevation gain in metres.">
        Trails by length
      </TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell sort={stateOf('name')} onSort={sortBy('name')}>
            Trail
          </TableHeaderCell>
          <TableHeaderCell>Region</TableHeaderCell>
          <TableHeaderCell numeric sort={stateOf('length')} onSort={sortBy('length')}>
            Length (km)
          </TableHeaderCell>
          <TableHeaderCell numeric>Gain (m)</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((trail) => (
          <TableRow key={trail.name}>
            <TableHeaderCell>{trail.name}</TableHeaderCell>
            <TableCell>{trail.region}</TableCell>
            <TableCell numeric>{number.format(trail.length)}</TableCell>
            <TableCell numeric>{trail.gain == null ? '—' : trail.gain}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeaderCell colSpan={2}>Total</TableHeaderCell>
          <TableCell numeric>{number.format(total)}</TableCell>
          <TableCell numeric>—</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  )
}
