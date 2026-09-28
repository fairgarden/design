import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import {
  CardGrid,
  CardGridFooter,
  CardGridFooterLink,
  CardGridItem,
  CardGridList,
} from '@fairgarden/design/content/card-grid'
import { SectionHeader } from '@fairgarden/design/page/section-header'
import styles from './kinds.module.css'

const programs = [
  { title: 'Spring bird count', meta: 'Program · May', body: 'Volunteers tally migrants along the river trail.' },
  { title: 'Meadow restoration', meta: 'Program · All year', body: 'Three seasons of native seed and patience.' },
  { title: 'Night walk', meta: 'Event · Fridays', body: 'Owls, moths and the smell of wet leaves.' },
]

const species = ['Barred owl', 'Wood thrush', 'Red eft', 'Pawpaw']

/**
 * Editorial grids go 1 → 2 → 3 columns on their container; compact grids
 * 1 → 2 → 4. `header` takes SectionHeader props (the grid is then labelled
 * by the heading) or any node, such as a SectionHeader element.
 */
export function CardGridKinds() {
  return (
    <div className={styles.stack}>
      <CardGrid kind="editorial" header={{ eyebrow: 'Programs', heading: 'Get outside' }}>
        <CardGridList>
          {programs.map((program) => (
            <CardGridItem key={program.title}>
              <Card faced>
                <CardTitle>
                  <CardTitleLink href="#kinds">{program.title}</CardTitleLink>
                </CardTitle>
                <CardMeta>{program.meta}</CardMeta>
                <CardBody>{program.body}</CardBody>
              </Card>
            </CardGridItem>
          ))}
        </CardGridList>
        <CardGridFooter>
          <CardGridFooterLink href="#kinds">See all programs</CardGridFooterLink>
        </CardGridFooter>
      </CardGrid>

      <CardGrid
        kind="compact"
        aria-labelledby="card-grid-species"
        header={<SectionHeader level="module" heading="On the preserve" headingId="card-grid-species" />}
      >
        <CardGridList>
          {species.map((name) => (
            <CardGridItem key={name}>
              <Card>
                <CardTitle>
                  <CardTitleLink href="#kinds">{name}</CardTitleLink>
                </CardTitle>
                <CardMeta>Seen this week</CardMeta>
              </Card>
            </CardGridItem>
          ))}
        </CardGridList>
      </CardGrid>
    </div>
  )
}
