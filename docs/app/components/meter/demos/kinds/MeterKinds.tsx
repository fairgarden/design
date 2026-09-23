'use client'

import { Meter, MeterPanel } from '@fairgarden-private/design/components/Meter'

const gigabytes = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** A meter panel: storage near its limit, an ordinal difficulty scale, segmented cells and a ring. */
export function MeterKinds() {
  return (
    <MeterPanel>
      <Meter
        label="Photo storage"
        value={9.4}
        max={10}
        threshold={9}
        formatValue={(_formatted, value) => `${gigabytes.format(value)} of 10 GB`}
        status="warning"
        statusText="Near limit"
      />
      <Meter kind="ordinal" label="Trail difficulty" value={2} stops={['Easy', 'Moderate', 'Hard', 'Strenuous']} />
      <Meter
        kind="steps"
        label="Volunteer shifts"
        value={3}
        max={5}
        formatValue={(_formatted, value) => `${value} of 5`}
      />
      <Meter kind="ring" label="Seed bank" value={72} />
    </MeterPanel>
  )
}
