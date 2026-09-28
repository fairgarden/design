import { createMultipleTypes } from '@/functions/createTypes';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuGroup,
  NavigationMenuPromo,
  NavigationMenuCategory,
  NavigationMenuFeaturedBar,
} from '@fairgarden/design/navigation/navigation-menu';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuGroup,
  NavigationMenuPromo,
  NavigationMenuCategory,
  NavigationMenuFeaturedBar,
});

export const TypesNavigationMenu = types;
export const TypesNavigationMenuAdditional = AdditionalTypes;
