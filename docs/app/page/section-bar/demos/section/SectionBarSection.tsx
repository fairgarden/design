'use client'

import * as React from 'react'
import { SectionBar } from '@fairgarden/design/page/section-bar'
import styles from './section.module.css'

const sections = [
  { id: 'bar-what', label: 'What community-centered conservation is' },
  { id: 'bar-who', label: 'For whom? By whom?' },
  { id: 'bar-how', label: 'How land trusts begin' },
]

/**
 * The section bar over three sections. The docs show the page in a frame
 * that scrolls on its own: scroll inside it and the bar docks and follows
 * the section in view.
 */
export function SectionBarSection() {
  const [docked, setDocked] = React.useState(false)

  return (
    <div className={styles.page}>
      <SectionBar
        capped
        docked={docked}
        onDockChange={setDocked}
        items={[
          { label: 'Home', href: '#bar-what' },
          { label: 'Resources', href: '#bar-what' },
          { label: 'Guides', href: '#bar-what' },
        ]}
        current="Community-centered conservation"
        sections={sections}
      />
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.heading}>{section.label}</h2>
          <p className={styles.text}>
            Land trusts work with the people who live on and near the land. This section runs long
            enough to scroll, so the bar can dock and follow the section in view.
          </p>
        </section>
      ))}
    </div>
  )
}
