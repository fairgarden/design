import { createMultipleTypes } from '@/functions/createTypes';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
} from '@fairgarden/design/overlays/context-menu';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
});

export const TypesContextMenu = types;
export const TypesContextMenuAdditional = AdditionalTypes;
