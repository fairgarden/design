'use client'

import * as React from 'react'
import { DocsLayout, DocsLayoutDrawer } from '@fairgarden/design/page/docs-layout'
import { NavigationBar } from '@fairgarden/design/navigation/navigation-bar'
import { SidebarNav } from '@fairgarden/design/navigation/sidebar-nav'
import {
  TableOfContents,
  useActiveHeading,
  type TableOfContentsItem,
} from '@fairgarden/design/navigation/table-of-contents'
import { Search } from '@fairgarden/design/forms/search'
import { handbook } from './handbook'
import styles from './handbook.module.css'

const contents: TableOfContentsItem[] = [
  { id: 'what-goes-in', title: 'What goes in', level: 2 },
  { id: 'greens', title: 'Greens', level: 3 },
  { id: 'browns', title: 'Browns', level: 3 },
  { id: 'the-three-bays', title: 'The three bays', level: 2 },
  { id: 'turning-days', title: 'Turning days', level: 3 },
  { id: 'worm-bins', title: 'Worm bins', level: 2 },
  { id: 'sharing-finished-compost', title: 'Sharing finished compost', level: 2 },
]

const ids = contents.map((item) => item.id)

/** The page's contents, marking the section in view. */
function Contents() {
  const activeId = useActiveHeading(ids)
  return <TableOfContents items={contents} activeId={activeId} />
}

/**
 * A page of the community garden handbook in the docs layout: the header
 * with its drawer, the handbook's page tree, the page and its contents.
 * Below 1024 px the menu Button opens the page tree in the drawer and the
 * contents sit in the "On this page" disclosure; from 1024 px the tree is
 * a column, and from 1440 px the contents are too. The docs show it in a
 * frame that is its own viewport; open the full page to see the columns.
 */
export function DocsLayoutHandbook() {
  return (
    <DocsLayout
      mainId="handbook-main"
      header={
        <NavigationBar
          wide
          logo={<span className={styles.wordmark}>Garden Handbook</span>}
          logoLabel="Garden Handbook home"
          logoHref="/handbook"
          currentPath="/handbook/composting"
          search={<Search kind="trigger" label="Search the handbook" />}
          drawer={<DocsLayoutDrawer />}
        />
      }
      sidebar={<SidebarNav items={handbook} currentPath="/handbook/composting" label="Handbook" />}
      toc={<Contents />}
    >
      <article className={styles.article}>
        <h1 className={styles.title}>Composting</h1>
        <p className={styles.lead}>
          Every plot shares the three-bay compost by the north gate. Here is what goes in, how
          the bays turn, and when the finished compost is ready to share.
        </p>

        <h2 id="what-goes-in" className={styles.h2}>
          What goes in
        </h2>
        <p className={styles.p}>
          A good heap is about two parts brown to one part green by volume. Chop anything
          thicker than a thumb, and leave out what the list below doesn&apos;t name.
        </p>
        <h3 id="greens" className={styles.h3}>
          Greens
        </h3>
        <p className={styles.p}>
          Spent crops, weeds that haven&apos;t set seed, grass clippings, coffee grounds and
          raw fruit and vegetable scraps from home. Greens bring the nitrogen and the water.
        </p>
        <h3 id="browns" className={styles.h3}>
          Browns
        </h3>
        <p className={styles.p}>
          Dry leaves, straw, shredded cardboard and the wood chips stacked behind the shed.
          Browns bring the carbon and the air; add a forkful with every bucket of greens.
        </p>

        <h2 id="the-three-bays" className={styles.h2}>
          The three bays
        </h2>
        <p className={styles.p}>
          The left bay takes new material. The middle bay holds last month&apos;s heap while it
          cooks, and the right bay holds compost that is resting and nearly ready. A chalk
          board on the gate says which bay is which this month.
        </p>
        <h3 id="turning-days" className={styles.h3}>
          Turning days
        </h3>
        <p className={styles.p}>
          On the first Saturday of the month the work-day crew moves each bay one step to the
          right. Bring gloves; forks are in the shed. The heap should feel as damp as a
          wrung-out sponge; if it is dry, the crew waters it as they turn.
        </p>

        <h2 id="worm-bins" className={styles.h2}>
          Worm bins
        </h2>
        <p className={styles.p}>
          Two worm bins sit in the shade of the tool shed for kitchen scraps in winter, when
          the big heap is too cold to work. Feed them little and often, bury food under the
          bedding, and keep citrus, onions and anything cooked out of them.
        </p>

        <h2 id="sharing-finished-compost" className={styles.h2}>
          Sharing finished compost
        </h2>
        <p className={styles.p}>
          Finished compost is dark, crumbly and smells of the woods. When the right bay is
          ready, the plot coordinators post a sign-up on the gate: each plot takes two
          barrow loads, and the rest goes to the shared herb beds.
        </p>
      </article>
    </DocsLayout>
  )
}
