import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import styles from './color.module.css'

/** The props pass through to the card's face scope. */
export function CardColor() {
  return (
    <div className={styles.grid}>
      <Card faced>
        <CardTitle>
          <CardTitleLink href="#color">Scope defaults</CardTitleLink>
        </CardTitle>
        <CardMeta>olive × green</CardMeta>
        <CardBody>Rules and text from olive, accents from green.</CardBody>
      </Card>
      <Card faced primary="slate" secondary="indigo">
        <CardTitle>
          <CardTitleLink href="#color">Royal pairing</CardTitleLink>
        </CardTitle>
        <CardMeta>primary=&quot;slate&quot; secondary=&quot;indigo&quot;</CardMeta>
        <CardBody>A verified pairing from the §2 matrix.</CardBody>
      </Card>
      <Card faced primary="olive" secondary="orange">
        <CardTitle>
          <CardTitleLink href="#color">Clay pairing</CardTitleLink>
        </CardTitle>
        <CardMeta>primary=&quot;olive&quot; secondary=&quot;orange&quot;</CardMeta>
        <CardBody>Olive keeps the text and rules; orange takes the accents.</CardBody>
      </Card>
    </div>
  )
}
