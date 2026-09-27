import { createMultipleTypes } from '@/functions/createTypes';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  AvatarGroup,
} from '@fairgarden/design/feedback/avatar';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  AvatarGroup,
});

export const TypesAvatar = types;
export const TypesAvatarAdditional = AdditionalTypes;
