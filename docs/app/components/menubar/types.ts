import { createMultipleTypes } from '@/functions/createTypes';
import { Menubar, MenubarMenu } from '@fairgarden-private/design/components/Menubar';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Menubar,
  MenubarMenu,
});

export const TypesMenubar = types;
export const TypesMenubarAdditional = AdditionalTypes;
