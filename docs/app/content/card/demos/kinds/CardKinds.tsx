import {
  Card,
  CardBody,
  CardFooter,
  CardKicker,
  CardMedia,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import { Link } from '@fairgarden/design/actions/link'
import styles from './kinds.module.css'

/** A flat square placeholder (inline SVG), standing in for a photograph in this demo. */
const square =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
      '<rect width="120" height="120" fill="#b8c4a8"/>' +
      '<path d="M0 88 34 52l24 20 20-14 42 34v28H0z" fill="#5f6f4e"/>' +
      '</svg>'
  )

export function CardKinds() {
  return (
    <div className={styles.grid}>
      <Card>
        <CardTitle>
          <CardTitleLink href="#kinds">Spring bird count</CardTitleLink>
        </CardTitle>
        <CardMeta>Editorial · bare (default)</CardMeta>
        <CardBody>Volunteers tally migrants along the river trail every May.</CardBody>
      </Card>
      <Card faced>
        <CardTitle>
          <CardTitleLink href="#kinds">Meadow restoration</CardTitleLink>
        </CardTitle>
        <CardMeta>Editorial · faced</CardMeta>
        <CardBody>Three seasons of native seed, burning and patience.</CardBody>
        <CardFooter>
          <Link kind="standalone" href="#kinds">
            Read more
          </Link>
        </CardFooter>
      </Card>
      <Card kind="block">
        <CardTitle>
          <CardTitleLink href="#kinds">Protect the headwaters</CardTitleLink>
        </CardTitle>
        <CardMeta>Block · featured</CardMeta>
        <CardBody>The block edge marks a featured card: one family per page.</CardBody>
      </Card>
      <Card kind="entry">
        <CardMedia>
          <img src={square} alt="" />
        </CardMedia>
        <CardKicker>Entry · hero</CardKicker>
        <CardTitle render={<p />}>
          <CardTitleLink href="#kinds">Find a land trust</CardTitleLink>
        </CardTitle>
      </Card>
    </div>
  )
}
