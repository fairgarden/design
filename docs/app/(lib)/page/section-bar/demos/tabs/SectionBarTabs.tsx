'use client'

import * as React from 'react'
import { Ground } from '@fairgarden/design/foundations/ground'
import { SectionBar } from '@fairgarden/design/page/section-bar'
import styles from './tabs.module.css'

const sections = [
  { id: 'tabs-fairgarden', label: 'FairGarden' },
  { id: 'tabs-community', label: 'Community' },
  { id: 'tabs-partners', label: 'Partners' },
]

/**
 * The tab strip from 1024 px, with the "Back to top" cell; below 1024 px it
 * is a section bar. The page is a white band, so the bar takes white, the
 * ground of the band it covers. The docs show the page in a frame that is
 * its own viewport and scrolls on its own; open the full page to see the
 * strip at the window's width.
 */
export function SectionBarTabs() {
  const [docked, setDocked] = React.useState(false)

  return (
    <Ground kind="band" preset="white" className={styles.page} id="tabs-top" tabIndex={-1}>
      <SectionBar
        kind="tabs"
        toTop="#tabs-top"
        docked={docked}
        onDockChange={setDocked}
        items={[{ label: 'Home', href: '#tabs-top' }]}
        current="Contact"
        sections={sections}
      />
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.heading}>{section.label}</h2>
          <p className={styles.text}>Scroll to move the current cell; click a cell to jump.</p>
        </section>
      ))}
    </Ground>
  )
}
