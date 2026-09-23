import { Figure, FigureCaption, FigureMedia } from '@fairgarden-private/design/components/Figure'
import styles from './side-caption.module.css'

/** From 768 px of the figure's own width, the caption moves beside the media. */
export function FigureSideCaption() {
  return (
    <Figure kind="technical" sideCaption className={styles.figure}>
      <FigureMedia>
        <svg className={styles.chart} viewBox="0 0 480 200" role="img" aria-label="Water level by month, highest in April">
          <path className={styles.axis} d="M40 20v160h420" />
          <path className={styles.series} d="M40 150 110 120l70-70 70 20 70 40 70 10 70 20" />
        </svg>
      </FigureMedia>
      <FigureCaption number={4} credit="Source: County water survey">
        Water level peaks in April, a month earlier than in 2020.
      </FigureCaption>
    </Figure>
  )
}
