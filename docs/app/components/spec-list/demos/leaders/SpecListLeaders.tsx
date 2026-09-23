import { SpecList, SpecListItem } from '@fairgarden-private/design/components/SpecList'

/** Label, dotted leader, value: prices and dimensions. */
export function SpecListLeaders() {
  return (
    <SpecList>
      <SpecListItem label="Print, 8 × 10 in">$24.00</SpecListItem>
      <SpecListItem label="Print, 11 × 14 in">$38.00</SpecListItem>
      <SpecListItem label="Framed print, 16 × 20 in, oak frame with archival mat">
        $120.00
      </SpecListItem>
      <SpecListItem label="Shipping">Free over $50.00, otherwise $6.50</SpecListItem>
    </SpecList>
  )
}
