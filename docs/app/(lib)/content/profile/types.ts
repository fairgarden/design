import { createMultipleTypes } from '@/functions/createTypes';
import {
  Profile,
  ProfilePortrait,
  ProfileTeamPhoto,
  ProfileDetails,
  ProfileName,
  ProfileNameLink,
  ProfileRole,
  ProfileBio,
  ProfileLinks,
  ProfileDate,
  ProfileTeam,
  ProfileMember,
} from '@fairgarden/design/content/profile';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Profile,
  ProfilePortrait,
  ProfileTeamPhoto,
  ProfileDetails,
  ProfileName,
  ProfileNameLink,
  ProfileRole,
  ProfileBio,
  ProfileLinks,
  ProfileDate,
  ProfileTeam,
  ProfileMember,
});

export const TypesProfile = types;
export const TypesProfileAdditional = AdditionalTypes;
