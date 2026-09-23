import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from '@fairgarden-private/design/components/Avatar'
import { PresetGround } from '@/components/PresetGround'
import { portrait } from '../portrait'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** Rings follow the ground; the initials face stays a light face; the group ring cuts a ground-colored gap. */
export function AvatarGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <div className={styles.avatars}>
            <Avatar size="md">
              <AvatarImage src={portrait} alt="Ana Díaz" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>BO</AvatarFallback>
              <AvatarStatus status="success" label="Online" />
            </Avatar>
          </div>
          <AvatarGroup size="sm" aria-label="Volunteers">
            <Avatar>
              <AvatarImage src={portrait} alt="Ana Díaz" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>BO</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>CP</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </PresetGround>
      ))}
    </div>
  )
}
