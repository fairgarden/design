import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@fairgarden/design/navigation/tabs'
import styles from './variants.module.css'

/**
 * Underline tabs (default), a longer underline row that scrolls with a ›
 * button, and the segmented bar, filled and bare.
 */
export function TabsVariants() {
  return (
    <div className={styles.stack}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="access">Trails and access</TabsTab>
          <TabsTab value="stewardship">Stewardship</TabsTab>
        </TabsList>
        <TabsPanel value="overview">
          <p className={styles.copy}>312 acres of wet meadow and oak savanna, protected since 1998.</p>
        </TabsPanel>
        <TabsPanel value="access">
          <p className={styles.copy}>Four marked trails, open dawn to dusk. Dogs on leash.</p>
        </TabsPanel>
        <TabsPanel value="stewardship">
          <p className={styles.copy}>Volunteers pull invasive buckthorn on the first Saturday of each month.</p>
        </TabsPanel>
      </Tabs>

      <Tabs defaultValue="easements">
        <TabsList>
          <TabsTab value="easements">Easements</TabsTab>
          <TabsTab value="acquisitions">Acquisitions</TabsTab>
          <TabsTab value="restoration">Restoration</TabsTab>
          <TabsTab value="monitoring">Monitoring</TabsTab>
          <TabsTab value="archive" disabled>
            Archive
          </TabsTab>
        </TabsList>
        <TabsPanel value="easements">
          <p className={styles.copy}>Four to six tabs hug their labels; the row scrolls when it runs out of room.</p>
        </TabsPanel>
        <TabsPanel value="acquisitions">
          <p className={styles.copy}>Land bought outright and held in trust.</p>
        </TabsPanel>
        <TabsPanel value="restoration">
          <p className={styles.copy}>Prairie seeding, wetland berms and prescribed burns.</p>
        </TabsPanel>
        <TabsPanel value="monitoring">
          <p className={styles.copy}>Annual visits to every protected parcel.</p>
        </TabsPanel>
        <TabsPanel value="archive">
          <p className={styles.copy}>Unavailable.</p>
        </TabsPanel>
      </Tabs>

      <Tabs variant="segmented" filled defaultValue="land">
        <TabsList>
          <TabsTab value="land">Protect land</TabsTab>
          <TabsTab value="water">Protect water and wetland habitat</TabsTab>
          <TabsTab value="people">Connect people</TabsTab>
        </TabsList>
        <TabsPanel value="land">
          <p className={styles.copy}>Filled segmented cells belong on paper and white only.</p>
        </TabsPanel>
        <TabsPanel value="water">
          <p className={styles.copy}>Long labels wrap to two lines instead of truncating.</p>
        </TabsPanel>
        <TabsPanel value="people">
          <p className={styles.copy}>Guided walks every weekend from April to October.</p>
        </TabsPanel>
      </Tabs>

      <Tabs variant="segmented" defaultValue="day">
        <TabsList>
          <TabsTab value="day">Day</TabsTab>
          <TabsTab value="week">Week</TabsTab>
          <TabsTab value="month">Month</TabsTab>
        </TabsList>
        <TabsPanel value="day">
          <p className={styles.copy}>Unfilled, the bar and weight alone mark the current cell.</p>
        </TabsPanel>
        <TabsPanel value="week">
          <p className={styles.copy}>Seven days of events.</p>
        </TabsPanel>
        <TabsPanel value="month">
          <p className={styles.copy}>The whole month at a glance.</p>
        </TabsPanel>
      </Tabs>
    </div>
  )
}
