import { Avatar, AvatarFallback } from '@fairgarden-private/design/components/Avatar'
import { Link } from '@fairgarden-private/design/components/Link'
import { SpecGridItem, SpecSheet } from '@fairgarden-private/design/components/SpecSheet'

/** A reference page's At a Glance: the identity block, then the lead beside the grid from 1024 px. */
export function SpecSheetGlance() {
  return (
    <SpecSheet
      split
      heading="At a Glance"
      identity={{
        portrait: (
          <Avatar size="lg">
            <AvatarFallback>WT</AvatarFallback>
          </Avatar>
        ),
        commonName: 'Wood Thrush',
        secondaryName: 'Hylocichla mustelina',
      }}
      lead={
        <p>
          A plump, cinnamon-backed thrush of eastern hardwood forests, best known for its
          flute-like, two-voiced song at dawn and dusk.
        </p>
      }
      provenance={
        <>
          Text adapted from{' '}
          <Link href="https://example.org/lives">
            <cite>Lives of North American Birds</cite>
          </Link>
          .
        </>
      }
      more={{
        label: 'More Details',
        openLabel: 'Fewer Details',
        children: (
          <>
            <SpecGridItem label="Nest">Cup of dead leaves and mud</SpecGridItem>
            <SpecGridItem label="Eggs">3–4, pale blue</SpecGridItem>
          </>
        ),
      }}
    >
      <SpecGridItem label="Category">Thrushes</SpecGridItem>
      <SpecGridItem label="Conservation status">Near threatened</SpecGridItem>
      <SpecGridItem label="Habitat">Deciduous forest</SpecGridItem>
      <SpecGridItem label="Length">18–21 cm (7–8 in)</SpecGridItem>
      <SpecGridItem label="Population" estimated>
        11 million
      </SpecGridItem>
      <SpecGridItem label="Region">Eastern North America</SpecGridItem>
    </SpecSheet>
  )
}
