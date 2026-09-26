import {
  IndexRow,
  IndexRowCount,
  IndexRowDek,
  IndexRowMeta,
  IndexRows,
  IndexRowsFooter,
  IndexRowsHeader,
  IndexRowsList,
  IndexRowTitle,
  IndexRowTitleLink,
} from '@fairgarden/design/content/index-rows'
import { Link } from '@fairgarden/design/actions/link'
import { thumb } from './thumb'
import styles from './kinds.module.css'

const topics = [
  { label: 'Birding', count: 29 },
  { label: 'Trail work', count: 21 },
  { label: 'Native plants', count: 17 },
]

/** Ranked (with counts), related (with thumbnails) and article rows. */
export function IndexRowsKinds() {
  return (
    <div className={styles.stack}>
      <IndexRows kind="ranked">
        <IndexRowsHeader>
          <h2 className={styles.heading}>Most read topics</h2>
        </IndexRowsHeader>
        <IndexRowsList>
          {topics.map((topic, index) => (
            <IndexRow key={topic.label} rank={index + 1}>
              <IndexRowTitle>
                <IndexRowTitleLink href="#kinds" aria-current={index === 1 ? 'page' : undefined}>
                  {topic.label}
                </IndexRowTitleLink>
                <IndexRowCount>({topic.count})</IndexRowCount>
              </IndexRowTitle>
            </IndexRow>
          ))}
        </IndexRowsList>
        <IndexRowsFooter>
          <Link kind="standalone" href="#kinds">
            See all topics
          </Link>
        </IndexRowsFooter>
      </IndexRows>

      <IndexRows kind="related">
        <IndexRowsHeader>
          <h2 className={styles.heading}>Related</h2>
        </IndexRowsHeader>
        <IndexRowsList>
          {['How owls hear', 'Nest boxes that work'].map((title) => (
            <IndexRow key={title} thumb={<img src={thumb} alt="" />}>
              <IndexRowTitle>
                <IndexRowTitleLink href="#kinds">{title}</IndexRowTitleLink>
              </IndexRowTitle>
            </IndexRow>
          ))}
        </IndexRowsList>
      </IndexRows>

      <IndexRows kind="article">
        <IndexRowsList>
          <IndexRow>
            <IndexRowTitle>
              <IndexRowTitleLink href="#kinds" index>
                The long return of the river otter
              </IndexRowTitleLink>
            </IndexRowTitle>
            <IndexRowMeta>Field notes · 12 Sep 2026</IndexRowMeta>
            <IndexRowDek>Twenty years after the last sighting, tracks on the sandbar.</IndexRowDek>
          </IndexRow>
          <IndexRow>
            <IndexRowTitle>
              <IndexRowTitleLink href="#kinds" index>
                Why we leave the dead trees standing
              </IndexRowTitleLink>
            </IndexRowTitle>
            <IndexRowMeta>Stewardship · 3 Sep 2026</IndexRowMeta>
          </IndexRow>
        </IndexRowsList>
      </IndexRows>
    </div>
  )
}
