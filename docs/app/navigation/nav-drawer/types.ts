import { createMultipleTypes } from '@/functions/createTypes';
import {
  NavDrawer,
  NavDrawerGroup,
  NavDrawerLink,
  NavDrawerFooter,
} from '@fairgarden/design/navigation/nav-drawer';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  NavDrawer,
  NavDrawerGroup,
  NavDrawerLink,
  NavDrawerFooter,
});

export const TypesNavDrawer = types;
export const TypesNavDrawerAdditional = AdditionalTypes;
