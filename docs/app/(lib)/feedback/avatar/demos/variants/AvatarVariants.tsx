import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from '@fairgarden/design/feedback/avatar'
import { portrait } from '../portrait'
import styles from './variants.module.css'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const people = ['Ana Díaz', 'Ben Okafor', 'Chloe Park', 'Dev Rao', 'Eli Moss', 'Fay Lund']

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

/** Five fixed sizes; the initials face shows until the photo loads, or if it fails. */
export function AvatarVariants() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {sizes.map((size) => (
          <Avatar key={size} size={size}>
            <AvatarImage src={portrait} alt="Ana Díaz" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className={styles.row}>
        {sizes.map((size) => (
          <Avatar key={size} size={size}>
            <AvatarFallback>BO</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className={styles.row}>
        <Avatar size="lg">
          <AvatarImage src={portrait} alt="" />
          <AvatarFallback>AD</AvatarFallback>
          <AvatarStatus status="success" label="Online" />
        </Avatar>
        <span className={styles.copy}>Ana Díaz · Online</span>
        <Avatar size="lg">
          <AvatarFallback>BO</AvatarFallback>
          <AvatarStatus status="warning" label="Away" />
        </Avatar>
        <span className={styles.copy}>Ben Okafor · Away</span>
      </div>
      <AvatarGroup size="md" total={9} aria-label="Stewardship team">
        {people.map((name) => (
          <Avatar key={name}>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </div>
  )
}
