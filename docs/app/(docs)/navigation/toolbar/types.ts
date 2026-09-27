import { createMultipleTypes } from '@/functions/createTypes';
import {
  Toolbar,
  ToolbarBottomRule,
  ToolbarButton,
  ToolbarCount,
  ToolbarGroup,
  ToolbarItem,
  ToolbarLink,
  ToolbarMore,
  ToolbarSeparator,
} from '@fairgarden/design/navigation/toolbar';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarItem,
  ToolbarLink,
  ToolbarCount,
  ToolbarMore,
  ToolbarBottomRule,
});

export const TypesToolbar = types;
export const TypesToolbarAdditional = AdditionalTypes;
