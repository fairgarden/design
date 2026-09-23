import { Breadcrumb, type BreadcrumbCrumb } from '@fairgarden-private/design/components/Breadcrumb'
import styles from './kinds.module.css'

/** Six ancestors, one of them a level without a page. */
const path: BreadcrumbCrumb[] = [
  { label: 'Home', href: '#kinds' },
  { label: 'Programs', href: '#kinds' },
  { label: 'Conservation', href: '#kinds' },
  { label: 'Regional' },
  { label: 'Land trusts', href: '#kinds' },
  { label: 'Stewardship', href: '#kinds' },
]

export function BreadcrumbKinds() {
  return (
    <div className={styles.stack}>
      <p className={styles.name}>inline</p>
      <div className={styles.frame}>
        <Breadcrumb items={path} current="Easement monitoring" />
      </div>
      <p className={styles.name}>staircase</p>
      <Breadcrumb kind="staircase" items={path.slice(0, 3)} current="Easement monitoring" />
      <p className={styles.name}>parent</p>
      <Breadcrumb kind="parent" items={path} current="Easement monitoring" />
    </div>
  )
}
