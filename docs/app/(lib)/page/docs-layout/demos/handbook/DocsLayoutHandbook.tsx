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
import { sections } from './sections'
import styles from './handbook.module.css'

const contents: TableOfContentsItem[] = sections.map(({ id, title, level }) => ({ id, title, level }))
const ids = contents.map((item) => item.id)

/** The page's contents, marking the section in view: the column from 1440 px, the compact bar below. */
function Contents() {
  const activeId = useActiveHeading(ids)
  return <TableOfContents items={contents} activeId={activeId} />
}

/**
 * A page of the community garden handbook in the docs layout: the header
 * with its drawer, the handbook's page tree, the page and its contents.
 * Below 1024 px the menu Button opens the page tree in the drawer; below
 * 1440 px the contents are the compact bar pinned under the header, which
 * names the section in view and opens the whole list; from 1024 px the
 * tree is a column, and from 1440 px the contents are too. The docs show
 * it in a frame that is its own viewport; open the full page to see the
 * columns.
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
          the bays turn, what to do when a heap sulks, and when the finished compost is ready to
          share.
        </p>
        {sections.map((section) => {
          const Heading = section.level === 2 ? 'h2' : 'h3'
          return (
            <React.Fragment key={section.id}>
              <Heading id={section.id} className={section.level === 2 ? styles.h2 : styles.h3}>
                {section.title}
              </Heading>
              <p className={styles.p}>{section.body}</p>
            </React.Fragment>
          )
        })}
      </article>
    </DocsLayout>
  )
}
