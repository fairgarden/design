'use client'

import * as React from 'react'
import { Chart } from '@fairgarden-private/design/components/Chart'

const counts = [
  { year: '2020', warblers: 38, sparrows: 64, finches: 22 },
  { year: '2021', warblers: 44, sparrows: 61, finches: 27 },
  { year: '2022', warblers: 51, sparrows: 58, finches: 31 },
  { year: '2023', warblers: 57, sparrows: 60, finches: 29 },
  { year: '2024', warblers: 66, sparrows: 55, finches: 35 },
  { year: '2025', warblers: 71, sparrows: 53, finches: 38 },
]

export function ChartLines() {
  return (
    <Chart
      kind="line"
      data={counts}
      categoryKey="year"
      categoryLabel="Year"
      series={[
        { key: 'warblers', name: 'Warblers' },
        { key: 'sparrows', name: 'Sparrows' },
        { key: 'finches', name: 'Finches' },
      ]}
      valueLabel="Birds counted"
      caption="Warblers overtook sparrows in 2024 as the hedgerows matured."
      source="Source: Spring bird count, one morning each May."
    />
  )
}
