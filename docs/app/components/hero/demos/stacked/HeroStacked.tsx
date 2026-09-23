import { Breadcrumb } from '@fairgarden-private/design/components/Breadcrumb'
import { Ground } from '@fairgarden-private/design/components/Ground'
import { Hero } from '@fairgarden-private/design/components/Hero'
import { photo } from '../photo'
import styles from './stacked.module.css'

/**
 * "C, stacked": the text band in the reading span, then the photo crossing
 * the night band's edge, the hill behind it and the caption on paper.
 */
export function HeroStacked() {
  return (
    <div className={styles.page}>
      <Hero
        kind="split"
        stacked
        preset="night"
        edge="hill"
        next="paper"
        wayfinding={
          <Breadcrumb items={[{ label: 'News', href: '#stacked' }]} current="Stories" />
        }
        title="The birds came back to Boone Creek"
        lede="Five years after the dams came out, the creek's thrushes are nesting again."
        photo={<img src={photo} alt="A wooded creek bend in early summer" />}
        caption="Boone Creek, Kentucky, in June. Photo: M. Chen"
      />
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.text}>The article begins here, on the page ground.</p>
        </div>
      </Ground>
    </div>
  )
}
