'use client'

import * as React from 'react'
import { Toggle } from '@fairgarden/design/actions/toggle'
import { ToggleGroup } from '@fairgarden/design/actions/toggle-group'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import styles from './agenda.module.css'

/** The attachments: each has a deep-link slug the cover document links to. */
const attachments = [
  {
    id: "Treasurer's report",
    slug: 'committee-meeting:treasurers-report',
    text: 'The garden holds $1,240 after the seed sale. Water and insurance are paid through June.',
  },
  {
    id: 'Plot waitlist',
    slug: 'committee-meeting:plot-waitlist',
    text: 'Four households wait for a plot; two plots by the gate come free in April.',
  },
  {
    id: 'Tool shed quote',
    slug: 'committee-meeting:tool-shed-quote',
    text: 'A cedar lean-to on the shed, built by the volunteer carpentry crew: $380 in materials.',
  },
  {
    id: 'Spring planting plan',
    slug: 'committee-meeting:spring-planting-plan',
    text: 'Peas and greens in March, the shared pumpkin patch in May, a new pollinator border along the fence.',
  },
]

const slugOf = (id: string) => attachments.find((attachment) => attachment.id === id)?.slug ?? ''

/** The attachment whose slug is the URL hash, if any. */
function attachmentFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  return attachments.find((attachment) => attachment.slug === hash)?.id
}

/**
 * A cover document with its attachments: the meeting's agenda (or, switched,
 * its minutes) above, and the documents it refers to in `frame="joined"`
 * file tabs below. A link in the cover selects that attachment's tab and
 * moves focus to it, as the tabs pattern does, scrolling it into view; a
 * modifier click opens the link as usual. The hash selects it on load too.
 * It all runs on FileTabs' controlled `value`, with no extra API.
 */
export function FileTabsAgenda() {
  const [cover, setCover] = React.useState<'agenda' | 'minutes'>('agenda')
  const [selected, setSelected] = React.useState(attachments[0].id)
  const frameRef = React.useRef<HTMLDivElement | null>(null)
  const current = attachments.find((attachment) => attachment.id === selected) ?? attachments[0]

  React.useEffect(() => {
    const latch = () => {
      const id = attachmentFromHash()
      if (id) setSelected(id)
    }
    latch()
    window.addEventListener('hashchange', latch)
    return () => window.removeEventListener('hashchange', latch)
  }, [])

  /** A cover link: a plain activation selects the tab and focuses it; a modifier one keeps the browser's own handling. */
  const open = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setSelected(id)
    const tab = frameRef.current?.querySelector<HTMLElement>(`[role="tab"][href="#${slugOf(id)}"]`)
    tab?.focus({ preventScroll: true })
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  const link = (id: string, words?: string) => (
    <a href={`#${slugOf(id)}`} onClick={open(id)}>
      {words ?? id}
    </a>
  )

  return (
    <div className={styles.stack}>
      {attachments.map((attachment) => (
        <span key={attachment.slug} id={attachment.slug} className={styles.target} />
      ))}
      <div ref={frameRef} className={styles.frame}>
        <div className={styles.cover}>
          <ToggleGroup
            variant="segmented"
            aria-label="Cover document"
            value={[cover]}
            onValueChange={(value) => {
              const next = value[value.length - 1]
              if (next === 'agenda' || next === 'minutes') setCover(next)
            }}
          >
            <Toggle value="agenda" size="sm">
              Agenda
            </Toggle>
            <Toggle value="minutes" size="sm">
              Minutes
            </Toggle>
          </ToggleGroup>
          {cover === 'agenda' ? (
            <>
              <h3 className={styles.title}>Garden committee, March meeting</h3>
              <p className={styles.muted}>Tuesday 10 March, 7 pm, in the Riverbend tool shed</p>
              <ol className={styles.list}>
                <li>Welcome and apologies</li>
                <li>{link("Treasurer's report")}</li>
                <li>{link('Plot waitlist')}: two plots to offer</li>
                <li>{link('Tool shed quote')}</li>
                <li>{link('Spring planting plan')}</li>
                <li>Any other business</li>
              </ol>
            </>
          ) : (
            <>
              <h3 className={styles.title}>Garden committee, March minutes</h3>
              <p>
                Seven members attended. The treasurer presented the {link("Treasurer's report", 'report')}{' '}
                and the committee thanked the seed-sale volunteers. Two households from the{' '}
                {link('Plot waitlist', 'waitlist')} will be offered the gate plots. The{' '}
                {link('Tool shed quote', 'lean-to quote')} was accepted, and the{' '}
                {link('Spring planting plan', 'planting plan')} adopted with the pollinator border.
              </p>
            </>
          )}
        </div>
        <FileTabs
          tabs={attachments.map((attachment) => ({ id: attachment.id, name: attachment.id, slug: attachment.slug }))}
          value={selected}
          onValueChange={setSelected}
          frame="joined"
        >
          <FileTabsList aria-label="Attachments" />
          <FileTabsPanel>
            <div className={styles.doc}>
              <h3 className={styles.title}>{current.id}</h3>
              <p>{current.text}</p>
            </div>
          </FileTabsPanel>
        </FileTabs>
      </div>
    </div>
  )
}
