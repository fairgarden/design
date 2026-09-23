'use client'

import * as React from 'react'
import { Search, type SearchSuggestionGroup } from '@fairgarden-private/design/components/Search'
import styles from './states.module.css'

const suggestions: SearchSuggestionGroup[] = [
  {
    label: 'Species',
    items: [
      { value: 'Great Egret', secondaryName: 'Ardea alba', href: '#egret' },
      { value: 'Snowy Egret', secondaryName: 'Egretta thula', href: '#snowy' },
      { value: 'Reddish Egret', secondaryName: 'Egretta rufescens', href: '#reddish' },
    ],
  },
  {
    label: 'Places',
    items: [
      { value: 'Egret Point', icon: 'chevron_right', href: '#point' },
      { value: 'Egret Marsh Trail', icon: 'chevron_right', href: '#marsh' },
    ],
  },
]

/**
 * Boxed with the butted submit and grouped suggestions, rule-bounded, the
 * header trigger, and the docked bar (inside a short scrolling frame).
 */
export function SearchKinds() {
  const [submitted, setSubmitted] = React.useState('')

  return (
    <div className={styles.stack}>
      <div>
        <p className={styles.label}>boxed</p>
        <Search
          label="Search the guide"
          placeholder="Search the guide…"
          items={suggestions}
          status="5 suggestions"
          seeAllHref={(query) => `#results-${encodeURIComponent(query)}`}
          submitLabelled
          onSubmit={(query) => setSubmitted(query)}
        />
        <p className={styles.label} aria-live="polite">
          {submitted ? `Searched for "${submitted}"` : 'Type "egret", then press Enter.'}
        </p>
      </div>
      <div>
        <p className={styles.label}>ruled</p>
        <Search kind="ruled" label="Filter events" placeholder="Filter events…" />
      </div>
      <div>
        <p className={styles.label}>trigger</p>
        <Search kind="trigger" label="Search" onClick={() => setSubmitted('the trigger')} />
      </div>
      <div>
        <p className={styles.label}>docked</p>
        <div className={styles.dockFrame}>
          <Search kind="docked" label="Search the guide" items={suggestions} />
          <p>Scroll this frame: the docked bar holds the top edge, alone.</p>
          <p>Herons stand still in the shallows and strike fast.</p>
          <p>Egrets hunt the same water in brighter white.</p>
          <p>Bitterns hide in the reeds and point their bills skyward.</p>
        </div>
      </div>
    </div>
  )
}
