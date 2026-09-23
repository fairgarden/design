'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import {
  Card,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import {
  CardGrid,
  CardGridCount,
  CardGridItem,
  CardGridList,
  CardGridToolbar,
} from '@fairgarden/design/content/card-grid'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateHeading,
  EmptyStateText,
} from '@fairgarden/design/content/empty-state'
import { Toggle } from '@fairgarden/design/actions/toggle'

const events = [
  { title: 'Night walk', format: 'In person' },
  { title: 'Seed swap', format: 'In person' },
  { title: 'Stream ecology talk', format: 'Virtual' },
  { title: 'Trail crew day', format: 'In person' },
]

/** The count is a polite live region; an empty result swaps the list for an EmptyState. */
export function CardGridFiltered() {
  const [virtualOnly, setVirtualOnly] = React.useState(false)
  const [hideVirtual, setHideVirtual] = React.useState(false)
  const shown = events.filter(
    (event) =>
      (!virtualOnly || event.format === 'Virtual') && (!hideVirtual || event.format !== 'Virtual')
  )

  return (
    <CardGrid kind="compact">
      <CardGridToolbar>
        <Toggle variant="chip" pressed={virtualOnly} onPressedChange={setVirtualOnly}>
          Virtual Only
        </Toggle>
        <Toggle variant="chip" pressed={hideVirtual} onPressedChange={setHideVirtual}>
          Hide Virtual
        </Toggle>
      </CardGridToolbar>
      <CardGridCount>
        {shown.length} {shown.length === 1 ? 'event' : 'events'}
      </CardGridCount>
      {shown.length > 0 ? (
        <CardGridList>
          {shown.map((event) => (
            <CardGridItem key={event.title}>
              <Card faced>
                <CardTitle>
                  <CardTitleLink href="#filtered">{event.title}</CardTitleLink>
                </CardTitle>
                <CardMeta>{event.format}</CardMeta>
              </Card>
            </CardGridItem>
          ))}
        </CardGridList>
      ) : (
        <EmptyState filtered>
          <EmptyStateHeading>No events match these filters</EmptyStateHeading>
          <EmptyStateText>“Virtual Only” and “Hide Virtual” leave nothing to show.</EmptyStateText>
          <EmptyStateAction>
            <Button
              onClick={() => {
                setVirtualOnly(false)
                setHideVirtual(false)
              }}
            >
              Clear Filters
            </Button>
          </EmptyStateAction>
        </EmptyState>
      )}
    </CardGrid>
  )
}
