import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from '@fairgarden-private/design/components/Avatar'
import { portrait } from '../portrait'
import styles from './color.module.css'

/** `primary` drives the ring; the initials face and status disc keep their own light face. */
export function AvatarColor() {
  return (
    <div className={styles.row}>
      <Avatar size="md" primary="plum">
        <AvatarImage src={portrait} alt="Ana Díaz" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
      <Avatar size="lg" primary="plum">
        <AvatarImage src={portrait} alt="Ana Díaz" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
      <Avatar size="lg" primary="bronze">
        <AvatarFallback>BO</AvatarFallback>
        <AvatarStatus status="info" label="In a meeting" />
      </Avatar>
    </div>
  )
}
