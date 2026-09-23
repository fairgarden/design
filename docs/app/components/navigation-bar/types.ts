import { createMultipleTypes } from '@/functions/createTypes';
import {
  NavigationBar,
  NavigationBarUtility,
  NavigationBarUtilityLink,
} from '@fairgarden-private/design/components/NavigationBar';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  NavigationBar,
  NavigationBarUtility,
  NavigationBarUtilityLink,
});

export const TypesNavigationBar = types;
export const TypesNavigationBarAdditional = AdditionalTypes;
