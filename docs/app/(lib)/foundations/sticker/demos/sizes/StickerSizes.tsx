import { Sticker } from '@fairgarden/design/foundations/sticker'
import { SeedlingArt, seedlingHalo, seedlingViewBox } from '../Seedling'
import styles from './sizes.module.css'

/** S (152 px) and L (312 px) with the halo, and the bare variant in the host's heading ink. */
export function StickerSizes() {
  return (
    <div className={styles.row}>
      <figure className={styles.item}>
        <Sticker viewBox={seedlingViewBox} halo={seedlingHalo}>
          <SeedlingArt />
        </Sticker>
        <figcaption className={styles.name}>S, with halo</figcaption>
      </figure>
      <figure className={styles.item}>
        <Sticker size="l" viewBox={seedlingViewBox} halo={seedlingHalo}>
          <SeedlingArt />
        </Sticker>
        <figcaption className={styles.name}>L, with halo</figcaption>
      </figure>
      <figure className={styles.item}>
        <Sticker bare viewBox={seedlingViewBox}>
          <SeedlingArt />
        </Sticker>
        <figcaption className={styles.name}>S, bare</figcaption>
      </figure>
    </div>
  )
}
