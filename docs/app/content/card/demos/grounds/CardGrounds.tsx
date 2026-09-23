import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden/design/content/card'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

/** A faced card is a white face on a page ground and a paper light island inside a field. */
export function CardGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.band}>
          <Card faced>
            <CardTitle>
              <CardTitleLink href="#grounds">Night walk</CardTitleLink>
            </CardTitle>
            <CardMeta>On {preset}</CardMeta>
            <CardBody>Owls, moths and the smell of wet leaves.</CardBody>
          </Card>
        </PresetGround>
      ))}
    </div>
  )
}
