import { Button } from '@fairgarden-private/design/components/Button'
import { Hero } from '@fairgarden-private/design/components/Hero'
import patterns from '@fairgarden-private/design/utils/pattern.module.css'
import styles from './technical.module.css'

/** D on white: the double frame, the install column and the info cells; the dot grid stays outside the frame. */
export function HeroTechnical() {
  return (
    <Hero
      kind="technical"
      preset="white"
      className={patterns.patternDotgrid}
      title="Respinner"
      lede="v2.4.0 · MIT · 4 kB"
      actions={
        <>
          <Button variant="solid" size="lg">
            Get Started
          </Button>
          <Button size="lg">Read the Docs</Button>
        </>
      }
      aside={
        <div className={styles.install}>
          <p className={styles.label}>Install</p>
          <code className={styles.code}>npm i respinner</code>
        </div>
      }
      cells={[
        { label: 'Size', value: '4 kB' },
        { label: 'Dependencies', value: '0' },
        { label: 'Browsers', value: '98%' },
        { label: 'License', value: 'MIT' },
      ]}
    />
  )
}
