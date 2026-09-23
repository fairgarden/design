import { ScrollArea } from '@fairgarden-private/design/components/ScrollArea'
import styles from './kinds.module.css'

const species = [
  'American Goldfinch',
  'Barn Swallow',
  'Belted Kingfisher',
  'Black-capped Chickadee',
  'Cedar Waxwing',
  'Common Yellowthroat',
  'Eastern Bluebird',
  'Great Blue Heron',
  'Indigo Bunting',
  'Northern Cardinal',
  'Red-winged Blackbird',
  'Song Sparrow',
  'Tree Swallow',
  'Wood Thrush',
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Panel (vertical), wide (horizontal) and rail (the 2 px position rail). */
export function ScrollAreaKinds() {
  return (
    <div className={styles.stack}>
      <section className={styles.example}>
        <h3 className={styles.name}>Panel</h3>
        <ScrollArea label="Species seen" className={styles.panel}>
          <ul className={styles.list}>
            {species.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </ScrollArea>
      </section>
      <section className={styles.example}>
        <h3 className={styles.name}>Wide</h3>
        <ScrollArea kind="wide" label="Monthly visits">
          <ol className={styles.row}>
            {months.map((month) => (
              <li key={month} className={styles.cell}>
                {month}
              </li>
            ))}
          </ol>
        </ScrollArea>
      </section>
      <section className={styles.example}>
        <h3 className={styles.name}>Rail</h3>
        <ScrollArea kind="rail" label="Featured preserves">
          <ol className={styles.row}>
            {species.slice(0, 8).map((name) => (
              <li key={name} className={styles.slide}>
                {name}
              </li>
            ))}
          </ol>
        </ScrollArea>
      </section>
    </div>
  )
}
