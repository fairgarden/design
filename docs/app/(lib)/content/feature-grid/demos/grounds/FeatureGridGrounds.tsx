import {
  FeatureGrid,
  FeatureGridBody,
  FeatureGridCell,
  FeatureGridDrawing,
  FeatureGridHeading,
  FeatureGridList,
} from '@fairgarden/design/content/feature-grid'
import { Ground } from '@fairgarden/design/foundations/ground'
import styles from './grounds.module.css'

/** A glossary grid: drawings in the ground's one ink, captions in caps. */
export function FeatureGridGrounds() {
  return (
    <div className={styles.row}>
      <Ground kind="face" preset="paper" className={styles.face}>
        <p className={styles.name}>paper</p>
        <Glossary />
      </Ground>
      <Ground kind="field" preset="forest" className={styles.face}>
        <p className={styles.name}>forest field</p>
        <Glossary />
      </Ground>
      <Ground kind="field" preset="leaf" className={styles.face}>
        <p className={styles.name}>leaf field</p>
        <Glossary />
      </Ground>
    </div>
  )
}

function Glossary() {
  return (
    <FeatureGrid kind="glossary">
      <FeatureGridList>
        <FeatureGridCell>
          <FeatureGridDrawing>
            <svg viewBox="0 0 64 64" strokeWidth="2">
              <path d="M8 56 32 12l24 44z" />
            </svg>
          </FeatureGridDrawing>
          <FeatureGridHeading>Above</FeatureGridHeading>
          <FeatureGridBody>Higher than the trail.</FeatureGridBody>
        </FeatureGridCell>
        <FeatureGridCell>
          <FeatureGridDrawing>
            <svg viewBox="0 0 64 64" strokeWidth="2">
              <circle cx="32" cy="32" r="22" />
            </svg>
          </FeatureGridDrawing>
          <FeatureGridHeading>Around</FeatureGridHeading>
          <FeatureGridBody>A loop back to the lot.</FeatureGridBody>
        </FeatureGridCell>
      </FeatureGridList>
    </FeatureGrid>
  )
}
