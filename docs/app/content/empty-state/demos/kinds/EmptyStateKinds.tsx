import { Button } from '@fairgarden/design/actions/button'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDrawing,
  EmptyStateHeading,
  EmptyStateText,
  EmptyStateTrail,
} from '@fairgarden/design/content/empty-state'
import { StickerDetail } from '@fairgarden/design/foundations/sticker'
import styles from './kinds.module.css'

/** Framed (default) with the trail, illustrated with a sticker, and inline. */
export function EmptyStateKinds() {
  return (
    <div className={styles.stack}>
      <EmptyState>
        <EmptyStateTrail />
        <EmptyStateHeading>No saved trails yet</EmptyStateHeading>
        <EmptyStateText>Save a trail from its page and it will wait for you here.</EmptyStateText>
        <EmptyStateAction>
          <Button>Browse Trails</Button>
        </EmptyStateAction>
      </EmptyState>

      <EmptyState kind="illustrated">
        <EmptyStateDrawing
          viewBox="0 0 152 152"
          halo={
            <path d="M36 128c-8 0-8-16 0-16h4c-4-12-10-32-10-54 0-12 14-14 28-8 4-12 22-20 42-18h12c8 0 6 12 4 20-6 20-18 28-28 32v28h28c8 0 8 16 0 16z" />
          }
        >
          {/* A seedling: silhouette at the S weight, the leaf veins one step lighter. */}
          <path d="M76 120V64" />
          <path d="M76 84c-16 0-32-10-36-28 18-2 32 8 36 28z" />
          <path d="M76 72c14-2 28-14 32-30-18 0-30 12-32 30z" />
          <path d="M44 120h64" />
          <StickerDetail>
            <path d="M74 82 50 60M78 70l24-22" />
          </StickerDetail>
          <circle cx="76" cy="120" r="3" fill="currentColor" stroke="none" />
        </EmptyStateDrawing>
        <EmptyStateHeading>No sightings this week</EmptyStateHeading>
        <EmptyStateText>Be the first to log a bird on the preserve.</EmptyStateText>
        <EmptyStateAction>
          <Button variant="solid">Log a Sighting</Button>
        </EmptyStateAction>
      </EmptyState>

      <div className={styles.panel}>
        <EmptyState kind="inline">
          <EmptyStateText>Readings will appear here after the first sync.</EmptyStateText>
        </EmptyState>
      </div>
    </div>
  )
}
