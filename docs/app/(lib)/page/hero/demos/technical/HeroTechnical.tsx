import { Button } from '@fairgarden/design/actions/button'
import { Hero } from '@fairgarden/design/page/hero'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './technical.module.css'

/** D on white: the double frame, the install column and the info cells; the dot grid stays outside the frame. */
export function HeroTechnical() {
  return (
    <Hero
      kind="technical"
      preset="white"
      className={patterns.patternDotgrid}
      title="Hedgerow"
      lede="v1.3.0 · MIT · 3 kB"
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
          <code className={styles.code}>npm i hedgerow</code>
        </div>
      }
      cells={[
        { label: 'Size', value: '3 kB' },
        { label: 'Dependencies', value: '0' },
        { label: 'Browsers', value: '98%' },
        { label: 'License', value: 'MIT' },
      ]}
    />
  )
}
