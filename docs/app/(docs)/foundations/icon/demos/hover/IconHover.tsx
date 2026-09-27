import { Icon, iconHost } from '@fairgarden/design/foundations/icon'
import styles from './hover.module.css'

/**
 * `weight="interactive"` draws the rest weight and swaps to emphasis while
 * the element carrying `iconHost` is hovered or pressed. A disabled host
 * keeps the rest weight.
 */
export function IconHover() {
  return (
    <div className={styles.row}>
      <button type="button" className={`${iconHost} ${styles.button}`}>
        <Icon name="close" weight="interactive" label="Close" />
      </button>
      <button type="button" className={`${iconHost} ${styles.button}`}>
        <Icon name="menu" size="tag" weight="interactive" label="Menu" />
      </button>
      <a href="#hover" className={`${iconHost} ${styles.link}`}>
        See all
        <Icon name="chevron_right" weight="interactive" className={styles.glyph} />
      </a>
      <button type="button" disabled className={`${iconHost} ${styles.button}`}>
        <Icon name="add" weight="interactive" label="Add (unavailable)" />
      </button>
    </div>
  )
}
