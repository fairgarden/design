import { Ground } from '@fairgarden-private/design/components/Ground'
import { SectionDivider } from '@fairgarden-private/design/components/SectionDivider'
import styles from './seams.module.css'

/**
 * paper → paper → tide → white. Each band pads its block edges with
 * --ds-space-section, and each seam divider is the lower band's first child.
 */
export function SectionDividerSeams() {
  return (
    <div className={styles.page}>
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.head}>Paper</p>
          <p className={styles.text}>A long run of reading ends here.</p>
          <SectionDivider kind="pause" className={styles.pause} />
          <p className={styles.text}>The pause breaks it once, then the text resumes.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="paper" className={styles.band}>
        <SectionDivider kind="seam" />
        <div className={styles.container}>
          <p className={styles.head}>Paper again: the seam rule</p>
        </div>
      </Ground>
      <Ground kind="band" preset="tide" className={styles.band}>
        <SectionDivider kind="page-seam" />
        <div className={styles.container}>
          <p className={styles.head}>Tide: the page-seam hairline</p>
          <SectionDivider kind="pause" ornament="dot" className={styles.pause} />
        </div>
      </Ground>
      <Ground kind="band" preset="white" className={styles.band}>
        <SectionDivider kind="page-seam" />
        <div className={styles.container}>
          <p className={styles.head}>White: the terminal band</p>
          <SectionDivider kind="pause" ornament="star" className={styles.pause} />
        </div>
      </Ground>
    </div>
  )
}
