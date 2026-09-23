import { Button } from '@fairgarden/design/actions/button'
import {
  Card,
  CardBody,
  CardFooter,
  CardMedia,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import styles from './lead.module.css'

const photo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3Crect width='3' height='2' fill='%23b7c4a8'/%3E%3Cpath d='M0 1.4 .9.9l.7.4.8-.6.6.5V2H0z' fill='%23627a55'/%3E%3C/svg%3E"

/** The lead card goes horizontal from 944 px of its grid; cards in a row share one height, footers pinned. */
export function CardLead() {
  return (
    <div className={styles.stack}>
      <div className={styles.lead}>
        <Card faced lead>
          <CardMedia>
            {/* A plain data-URI stand-in photo; next/image adds nothing here. */}
            <img src={photo} alt="" />
          </CardMedia>
          <CardTitle>
            <CardTitleLink href="#lead">The river comes back</CardTitleLink>
          </CardTitle>
          <CardMeta>Feature · 12 min read</CardMeta>
          <CardBody>
            Ten years after the dam came out, the shad run is the largest on record and the
            floodplain forest is filling in on its own.
          </CardBody>
          <CardFooter>
            <Button size="sm">Read the Story</Button>
          </CardFooter>
        </Card>
      </div>

      <div className={styles.row}>
        <Card faced>
          <CardTitle>
            <CardTitleLink href="#lead">Owl prowl</CardTitleLink>
          </CardTitle>
          <CardMeta>Sat 12 Oct · North kiosk</CardMeta>
          <CardBody>A short walk after dark.</CardBody>
          <CardFooter>
            <Button size="sm">Get Tickets</Button>
          </CardFooter>
        </Card>
        <Card faced>
          <CardTitle>
            <CardTitleLink href="#lead">Seed library open house</CardTitleLink>
          </CardTitle>
          <CardMeta>Sun 13 Oct · Barn</CardMeta>
          <CardBody>
            Bring seed from your garden, take seed home, and learn to clean and store what you
            saved this year.
          </CardBody>
          <CardFooter>
            <Button size="sm">Get Tickets</Button>
          </CardFooter>
        </Card>
        <Card faced disabled>
          <CardTitle>
            <CardTitleLink href="#lead">Spring bird count</CardTitleLink>
          </CardTitle>
          <CardMeta>Past event</CardMeta>
          <CardBody>Unavailable: a dotted edge and muted text, the action removed.</CardBody>
          <CardFooter>
            <Button size="sm">Get Tickets</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
