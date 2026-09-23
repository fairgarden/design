import {
  Marker,
  MarkerIndex,
  MarkerRank,
  OrnamentBlob,
  OrnamentTrail,
} from '@fairgarden-private/design/utils/Ornament'
import styles from './ornaments.module.css'

/** The trail (short tail and entry), the marker set (trail, timeline, index and rank) and the blob mount. */
export function PatternOrnaments() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <OrnamentTrail />
        <div className={styles.entry}>
          <OrnamentTrail shape="entry" />
          <span className={styles.label}>Get outside</span>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.set}>
          <Marker kind="origin" />
          <Marker kind="waypoint" />
          <Marker kind="terminal" angle={0} />
          <span className={styles.name}>On a trail</span>
        </span>
        <span className={styles.set}>
          <Marker kind="origin" size="timeline" />
          <Marker kind="waypoint" size="timeline" />
          <Marker kind="current" size="timeline" />
          <Marker kind="terminal" size="timeline" />
          <span className={styles.name}>On a timeline</span>
        </span>
        <span className={styles.set}>
          <MarkerIndex value={1} />
          <MarkerIndex value={2} />
          <MarkerIndex value={12} />
          <span className={styles.name}>Index</span>
        </span>
        <span className={styles.set}>
          <MarkerRank value={1} />
          <MarkerRank value={2} />
          <MarkerRank value={10} />
          <span className={styles.name}>Rank</span>
        </span>
      </div>
      <div className={styles.row}>
        <OrnamentBlob>
          <span className={styles.numeral}>40</span>
        </OrnamentBlob>
        <span className={styles.name}>Blob mount with a stat numeral</span>
      </div>
    </div>
  )
}
