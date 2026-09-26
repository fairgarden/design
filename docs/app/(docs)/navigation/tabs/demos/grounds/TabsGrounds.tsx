import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@fairgarden/design/navigation/tabs'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The segmented cell fills on paper only; on forest the bar and weight carry "current". */
export function TabsGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Tabs defaultValue="map">
            <TabsList>
              <TabsTab value="map">Map</TabsTab>
              <TabsTab value="list">List</TabsTab>
            </TabsList>
            <TabsPanel value="map">
              <p className={styles.copy}>Trailheads and parking.</p>
            </TabsPanel>
            <TabsPanel value="list">
              <p className={styles.copy}>Every preserve, A to Z.</p>
            </TabsPanel>
          </Tabs>
          {preset === 'paper' ? (
            <Tabs variant="segmented" filled defaultValue="now">
              <TabsList>
                <TabsTab value="now">Now</TabsTab>
                <TabsTab value="later">Later</TabsTab>
              </TabsList>
              <TabsPanel value="now">
                <p className={styles.copy}>Filled on a light ground.</p>
              </TabsPanel>
              <TabsPanel value="later">
                <p className={styles.copy}>Upcoming.</p>
              </TabsPanel>
            </Tabs>
          ) : (
            <Tabs variant="segmented" defaultValue="now">
              <TabsList>
                <TabsTab value="now">Now</TabsTab>
                <TabsTab value="later">Later</TabsTab>
              </TabsList>
              <TabsPanel value="now">
                <p className={styles.copy}>No cell fill on a deep ground.</p>
              </TabsPanel>
              <TabsPanel value="later">
                <p className={styles.copy}>Upcoming.</p>
              </TabsPanel>
            </Tabs>
          )}
        </PresetGround>
      ))}
    </div>
  )
}
