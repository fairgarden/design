import { Marquee } from '@fairgarden-private/design/components/Marquee'
import styles from './grounds.module.css'

/** A hanging sprout drawn in currentColor (the --primary12 line) with --role-halo fills. */
function Sprout() {
  return (
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false" className={styles.drawing}>
      <path d="M60 158V70" />
      <path d="M60 96c-22 0-38-14-40-36 22 0 38 14 40 36Z" />
      <path d="M60 80c20 0 36-14 38-34-20 0-36 14-38 34Z" />
      <circle cx="60" cy="40" r="22" />
    </svg>
  )
}

const phrases = ['Grown Here', 'Picked This Morning', 'Never Frozen']

/** The default forest field with a hanging drawing, the page-ground run and the quote ticker. */
export function MarqueeGrounds() {
  return (
    <div className={styles.stack}>
      <Marquee label="What we stand for" phrases={phrases} drawing={<Sprout />} />
      <p className={styles.note}>Page content continues below the hanging drawing.</p>
      <Marquee label="What we stand for, on the page ground" phrases={phrases} fielded={false} />
      <Marquee
        kind="ticker"
        label="What visitors say"
        phrases={['“The best tomatoes in the valley.”', '“Worth the drive.”']}
      />
    </div>
  )
}
