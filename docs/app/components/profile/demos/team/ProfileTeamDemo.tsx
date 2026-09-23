import {
  Profile,
  ProfileMember,
  ProfileName,
  ProfileNameLink,
  ProfileRole,
  ProfileTeam,
  ProfileTeamPhoto,
} from '@fairgarden-private/design/components/Profile'
import { portrait } from '../portrait'

const people = [
  { name: 'Ana Díaz', role: 'Stewardship director' },
  { name: 'Ben Okafor', role: 'Trail crew lead' },
  { name: 'Mei Lin', role: 'Education' },
  { name: 'Sam Reyes', role: 'Former board chair' },
  { name: 'Iris Novak', role: 'Development' },
]

/** Team cells: 1-up below 360 px of container, 2-up from 360, 4-up from 768, up to 5 from 1024. */
export function ProfileTeamDemo() {
  return (
    <Profile kind="team">
      <ProfileTeam>
        {people.map((person) => (
          <ProfileMember key={person.name}>
            <ProfileTeamPhoto src={portrait} alt="" />
            <ProfileName>
              <ProfileNameLink href="#team">{person.name}</ProfileNameLink>
            </ProfileName>
            <ProfileRole>{person.role}</ProfileRole>
          </ProfileMember>
        ))}
      </ProfileTeam>
    </Profile>
  )
}
