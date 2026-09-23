'use client'

import * as React from 'react'
import { SectionBar } from '@fairgarden-private/design/components/SectionBar'
import styles from './tabs.module.css'

const sections = [
  { id: 'tabs-alliance', label: 'Land Trust Alliance' },
  { id: 'tabs-community', label: 'Community' },
  { id: 'tabs-affiliates', label: 'Affiliates' },
]

/** The tab strip from 1024 px, with the "Back to top" cell; below 1024 px it is a section bar. */
export function SectionBarTabs() {
  const [docked, setDocked] = React.useState(false)

  return (
    <div className={styles.page} id="tabs-top" tabIndex={-1}>
      <SectionBar
        kind="tabs"
        toTop="#tabs-top"
        docked={docked}
        onDockChange={setDocked}
        preset="white"
        items={[{ label: 'Home', href: '#tabs-top' }]}
        current="Connect"
        sections={sections}
      />
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.heading}>{section.label}</h2>
          <p className={styles.text}>Scroll to move the current cell; click a cell to jump.</p>
        </section>
      ))}
    </div>
  )
}
