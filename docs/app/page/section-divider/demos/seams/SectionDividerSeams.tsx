import { Ground } from '@fairgarden/design/foundations/ground'
import { SectionDivider } from '@fairgarden/design/page/section-divider'
import styles from './seams.module.css'

/**
 * paper → paper → tide → white. Each band pads its block edges with
 * --fgd-space-section, and each seam divider is the lower band's first child.
 * A pause breaks a band's reading column once, between two runs of text,
 * never at the band's edge.
 */
export function SectionDividerSeams() {
  return (
    <div className={styles.page}>
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.column}>
          <p className={styles.head}>Paper: the dotted pause</p>
          <p className={styles.text}>
            A long run of reading ends here, after the survey of the upper meadow and its hedgerows.
          </p>
          <SectionDivider kind="pause" className={styles.pause} />
          <p className={styles.text}>The pause breaks it once, then the text resumes.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="paper" className={styles.band}>
        <SectionDivider kind="seam" />
        <div className={styles.column}>
          <p className={styles.head}>Paper again: the seam rule</p>
          <p className={styles.text}>Two bands on the same ground meet across the seam rule.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="tide" className={styles.band}>
        <SectionDivider kind="page-seam" />
        <div className={styles.column}>
          <p className={styles.head}>Tide: the page-seam hairline</p>
          <p className={styles.text}>The letter closes its account of the spring count here.</p>
          <SectionDivider kind="pause" ornament="dot" className={styles.pause} />
          <p className={styles.text}>After the rule–dot–rule, a new thought begins.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="white" className={styles.band}>
        <SectionDivider kind="page-seam" />
        <div className={styles.column}>
          <p className={styles.head}>White: the terminal band</p>
          <p className={styles.text}>The menu of guided walks runs through the summer.</p>
          <SectionDivider kind="pause" ornament="star" className={styles.pause} />
          <p className={styles.text}>The dot-and-star sets off the autumn listings.</p>
        </div>
      </Ground>
    </div>
  )
}
