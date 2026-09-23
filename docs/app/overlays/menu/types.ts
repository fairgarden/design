import { createMultipleTypes } from '@/functions/createTypes';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
} from '@fairgarden/design/overlays/menu';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
});

export const TypesMenu = types;
export const TypesMenuAdditional = AdditionalTypes;
