import { Breadcrumb } from '@fairgarden/design/navigation/breadcrumb'
import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Hero } from '@fairgarden/design/page/hero'
import { photo } from '../photo'
import styles from './split.module.css'

/**
 * C on the night band: the text beside the photo from 1024 px, a media
 * Button on the photo, and the explore rail with its trail into paper.
 */
export function HeroSplit() {
  return (
    <div className={styles.page}>
      <Hero
        kind="split"
        preset="night"
        next="paper"
        wayfinding={<Breadcrumb items={[{ label: 'Programs', href: '#split' }]} current="Farmland" />}
        title="Keeping farms in farming"
        lede="Easements that let a family keep working the land, and keep it open for good."
        actions={
          <Button variant="solid" size="lg">
            Talk to Us
          </Button>
        }
        photo={<img src={photo} alt="A family walking a hayfield at the edge of a wood" />}
        caption="The Okafor farm, Wisconsin. Photo: J. Lee"
        photoAction={
          <Button iconOnly onMedia icon="zoom_in">
            Enlarge the Photo
          </Button>
        }
        rail={{ href: '#split', label: 'Explore the land' }}
      />
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.text}>The trail lands in this band, in its accent.</p>
        </div>
      </Ground>
    </div>
  )
}
