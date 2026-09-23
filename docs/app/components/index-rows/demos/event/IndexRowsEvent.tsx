import { Button } from '@fairgarden-private/design/components/Button'
import {
  IndexRow,
  IndexRowDisclosure,
  IndexRows,
  IndexRowsList,
} from '@fairgarden-private/design/components/IndexRows'
import styles from './event.module.css'

const events = [
  { date: '2026-10-03', key: '03 / 10', title: 'Night walk at Hemlock Ravine', meta: 'In person · 7 p.m.' },
  { date: '2026-10-11', key: '11 / 10', title: 'Seed swap', meta: 'In person · 10 a.m.' },
  { date: '2026-09-12', key: '12 / 09', title: 'Stream ecology talk', meta: 'Virtual · Past' },
]

/** Event rows expand in place; collapsed titles are muted, open titles grow and darken. */
export function IndexRowsEvent() {
  return (
    <IndexRows kind="event">
      <IndexRowsList>
        {events.map((event) => (
          <IndexRow key={event.title} date={<time dateTime={event.date}>{event.key}</time>}>
            <IndexRowDisclosure title={event.title} meta={event.meta}>
              <p>Meet at the north kiosk. Bring a red light; we walk slowly and quietly.</p>
              <dl className={styles.pairs}>
                <dt>Host</dt>
                <dd>Ana Díaz</dd>
                <dt>Entrance</dt>
                <dd>North lot</dd>
              </dl>
              <Button size="sm">Register</Button>
            </IndexRowDisclosure>
          </IndexRow>
        ))}
      </IndexRowsList>
    </IndexRows>
  )
}
