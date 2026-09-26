import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@fairgarden/design/navigation/tabs'
import styles from './color.module.css'

/** `primary` drives labels, bar and baseline; `secondary` only the filled segmented cell. */
export function TabsColor() {
  return (
    <div className={styles.stack}>
      <Tabs primary="plum" defaultValue="birds">
        <TabsList>
          <TabsTab value="birds">Birds</TabsTab>
          <TabsTab value="plants">Plants</TabsTab>
          <TabsTab value="insects">Insects</TabsTab>
        </TabsList>
        <TabsPanel value="birds">
          <p className={styles.copy}>Primary plum: labels, bar and baseline.</p>
        </TabsPanel>
        <TabsPanel value="plants">
          <p className={styles.copy}>Sedges, milkweed and bur oak.</p>
        </TabsPanel>
        <TabsPanel value="insects">
          <p className={styles.copy}>Monarchs and native bees.</p>
        </TabsPanel>
      </Tabs>

      <Tabs variant="segmented" filled secondary="indigo" defaultValue="visit">
        <TabsList>
          <TabsTab value="visit">Visit</TabsTab>
          <TabsTab value="volunteer">Volunteer</TabsTab>
          <TabsTab value="give">Give</TabsTab>
        </TabsList>
        <TabsPanel value="visit">
          <p className={styles.copy}>Secondary indigo: the filled cell and its edge.</p>
        </TabsPanel>
        <TabsPanel value="volunteer">
          <p className={styles.copy}>Workdays run year round.</p>
        </TabsPanel>
        <TabsPanel value="give">
          <p className={styles.copy}>Every gift stays local.</p>
        </TabsPanel>
      </Tabs>
    </div>
  )
}
