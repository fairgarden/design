import { Figure, FigureCaption, FigureMedia } from '@fairgarden-private/design/components/Figure'
import styles from './kinds.module.css'

/** Stands in for a photo: a flat drawing of a marsh at dusk. */
function MarshPhoto() {
  return (
    <svg className={styles.photo} viewBox="0 0 480 320" role="img" aria-label="A marsh at dusk">
      <rect className={styles.sky} width="480" height="320" />
      <path className={styles.hills} d="M0 190 120 140l110 40 90-50 160 60v130H0z" />
      <path className={styles.water} d="M0 230h480v90H0z" />
      <path className={styles.reeds} d="M40 320v-80M52 320v-96M64 320v-70M410 320v-88M424 320v-104M436 320v-76" />
    </svg>
  )
}

/** Stands in for a technical drawing: a leaf in outline with its dimension line. */
function LeafDrawing() {
  return (
    <svg className={styles.drawing} viewBox="0 0 320 200" role="img" aria-label="Leaf outline, 18 cm long">
      <path className={styles.line} d="M40 100C90 30 230 30 280 100 230 170 90 170 40 100Z" />
      <path className={styles.line} d="M40 100h240M110 100l40-40M170 100l40-40M110 100l40 40M170 100l40 40" />
      <path className={styles.line} d="M40 186h240M40 180v12M280 180v12" />
    </svg>
  )
}

/** The three kinds: an editorial photo, a framed technical figure and a specimen plate. */
export function FigureKinds() {
  return (
    <div className={styles.stack}>
      <Figure>
        <FigureMedia>
          <MarshPhoto />
        </FigureMedia>
        <FigureCaption credit="Photo: Ada Reyes / Marsh Program">
          The reed line marks the high-water mark of the spring flood.
        </FigureCaption>
      </Figure>
      <Figure kind="technical" framed>
        <FigureMedia>
          <LeafDrawing />
        </FigureMedia>
        <FigureCaption number={3}>Leaf of the swamp white oak, lobes shallow and rounded.</FigureCaption>
      </Figure>
      <Figure kind="plate">
        <FigureMedia>
          <LeafDrawing />
        </FigureMedia>
        <FigureCaption number={1} numbering="catalog" detail>
          Specimen from the north meadow collection.
        </FigureCaption>
      </Figure>
    </div>
  )
}
