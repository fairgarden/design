import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Hero, HeroLockup } from '@fairgarden/design/page/hero'
import styles from './illustrated.module.css'

/** B on paper: the Display Lockup and a sticker in the page's leaf campaign field. */
export function HeroIllustrated() {
  return (
    <div className={styles.page}>
      <Hero
        kind="illustrated"
        field="leaf"
        next="paper"
        title={<HeroLockup caps="Grown right" accent="here" />}
        lede="Burgers from farms within a hundred miles, cooked on the corner since 2009."
        actions={
          <Button variant="solid" size="lg">
            Order Now
          </Button>
        }
        drawing={
          <svg viewBox="0 0 312 312" role="img" aria-label="A sprouting seed">
            <circle cx="156" cy="170" r="104" fill="var(--role-halo)" />
            <path
              d="M156 250v-86m0 0c0-40 28-64 64-64-4 40-28 64-64 64Zm0 0c0-34-24-56-58-56 4 34 26 56 58 56Z"
              fill="none"
              stroke="var(--primary12)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M96 250h120"
              stroke="var(--primary12)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        }
        rail={{ href: '#illustrated', label: 'Find a kitchen' }}
      />
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.text}>The rail&rsquo;s trail crosses into this band.</p>
        </div>
      </Ground>
    </div>
  )
}
