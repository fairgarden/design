import { AvatarFallback, AvatarImage } from '@fairgarden-private/design/components/Avatar'
import { Link } from '@fairgarden-private/design/components/Link'
import {
  Profile,
  ProfileBio,
  ProfileDate,
  ProfileDetails,
  ProfileLinks,
  ProfileName,
  ProfileNameLink,
  ProfilePortrait,
  ProfileRole,
} from '@fairgarden-private/design/components/Profile'
import { portrait } from '../portrait'
import styles from './kinds.module.css'

/** The Avatar size follows the kind: byline 32 px, author 40 px, bio 64 px (128 px when wide). */
export function ProfileKinds() {
  return (
    <div className={styles.stack}>
      <Profile kind="byline">
        <ProfilePortrait>
          <AvatarImage src={portrait} alt="" />
          <AvatarFallback>AD</AvatarFallback>
        </ProfilePortrait>
        <ProfileName>
          By <ProfileNameLink href="#kinds">Ana Díaz</ProfileNameLink>
        </ProfileName>
        <ProfileDate dateTime="2026-09-12">12 Sep 2026</ProfileDate>
      </Profile>

      <Profile kind="author">
        <ProfilePortrait>
          <AvatarFallback>HR</AvatarFallback>
        </ProfilePortrait>
        <ProfileName>Hemlock Ravine Land Trust</ProfileName>
        <ProfileBio>
          A member-supported land trust caring for 1,200 acres of forest and meadow since 1987.
        </ProfileBio>
      </Profile>

      <Profile kind="bio">
        <ProfilePortrait>
          <AvatarImage src={portrait} alt="" />
          <AvatarFallback>AD</AvatarFallback>
        </ProfilePortrait>
        <ProfileDetails>
          <ProfileName>Ana Díaz</ProfileName>
          <ProfileRole>Stewardship director</ProfileRole>
          <ProfileBio>
            Ana leads the trail crews and the spring bird count. Before the trust she mapped
            wetlands for the state and still can’t pass a puddle without checking for eggs.
          </ProfileBio>
          <ProfileLinks>
            <li>
              <Link href="#kinds">ana@example.org</Link>
            </li>
            <li>
              <Link href="#kinds">@anadiaz</Link>
            </li>
          </ProfileLinks>
        </ProfileDetails>
      </Profile>
    </div>
  )
}
