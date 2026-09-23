'use client'

import * as React from 'react'
import { SectionBar } from '@fairgarden-private/design/components/SectionBar'
import { Search } from '@fairgarden-private/design/components/Search'
import styles from './guide.module.css'

const birds = [
  { value: 'Wood Thrush', secondaryName: 'Hylocichla mustelina' },
  { value: 'Hermit Thrush', secondaryName: 'Catharus guttatus' },
  { value: 'Veery', secondaryName: 'Catharus fuscescens' },
]

/** The guide bar: search at the start, the centred breadcrumb, Jump to and the Listen jump at the end. */
export function SectionBarGuide() {
  const [docked, setDocked] = React.useState(false)

  return (
    <div className={styles.page}>
      <SectionBar
        kind="guide"
        docked={docked}
        onDockChange={setDocked}
        search={<Search label="Search the guide" hideSubmit items={birds} />}
        items={[
          { label: 'Bird guide', href: '#guide-overview' },
          { label: 'Thrushes', href: '#guide-overview' },
        ]}
        current="Wood Thrush"
        listen={{ href: '#guide-recordings', count: 6 }}
        sections={[
          { id: 'guide-overview', label: 'Overview' },
          { id: 'guide-recordings', label: 'Songs and calls' },
        ]}
      />
      <section id="guide-overview" className={styles.section}>
        <h2 className={styles.heading}>Overview</h2>
        <p className={styles.text}>A plump thrush of eastern forests, rust above and spotted below.</p>
      </section>
      <section id="guide-recordings" className={styles.section}>
        <h2 className={styles.heading}>Songs and calls</h2>
        <p className={styles.text}>Following Listen moves focus to this heading.</p>
      </section>
    </div>
  )
}
