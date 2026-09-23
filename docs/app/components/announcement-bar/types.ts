import { createMultipleTypes } from '@/functions/createTypes';
import {
  AnnouncementBar,
  AnnouncementBarAccent,
} from '@fairgarden-private/design/components/AnnouncementBar';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  AnnouncementBar,
  AnnouncementBarAccent,
});

export const TypesAnnouncementBar = types;
export const TypesAnnouncementBarAdditional = AdditionalTypes;
