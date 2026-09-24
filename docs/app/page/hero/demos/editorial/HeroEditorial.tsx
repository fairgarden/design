import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Hero } from '@fairgarden/design/page/hero'
import { photo, square } from '../photo'
import styles from './editorial.module.css'

/**
 * A on paper, then A as the media hero on the night band with three entry
 * cards across its edge into the white band below.
 */
export function HeroEditorial() {
  return (
    <div className={styles.page}>
      <Hero
        wayfinding={<p className={styles.eyebrow}>Annual report</p>}
        title={
          <>
            Gardens for good, <em>for everyone</em>
          </>
        }
        lede="Ten years of shared plots, open gates and neighbors who kept them."
        actions={
          <>
            <Button variant="solid" size="lg">
              Read the Report
            </Button>
            <Button size="lg">Download PDF</Button>
          </>
        }
      />
      <Hero
        preset="night"
        next="white"
        title="The prairie, one acre at a time"
        lede="A reference page's media hero: the photo figure under centred text."
        photo={<img src={photo} alt="Tallgrass prairie at dawn under a low sun" />}
        caption="Cedar Bend Prairie, Illinois. Photo: A. Rivera"
        entries={[
          {
            href: '#editorial',
            category: 'Program',
            title: 'Protect your land',
            image: <img src={square} alt="" />,
          },
          {
            href: '#editorial',
            category: 'Events',
            title: 'Harvest Gathering 2026',
            image: <img src={square} alt="" />,
          },
          {
            href: '#editorial',
            category: 'Resources',
            title: 'The garden handbook',
            image: <img src={square} alt="" />,
          },
        ]}
      />
      <Ground kind="band" preset="white" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.text}>
            The white band below opens with its section space; the cards stack here below 1024 px.
          </p>
        </div>
      </Ground>
    </div>
  )
}
