import { createMultipleTypes } from '@/functions/createTypes';
import { SidebarNav } from '@fairgarden/design/navigation/sidebar-nav';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  SidebarNav,
});

export const TypesSidebarNav = types;
export const TypesSidebarNavAdditional = AdditionalTypes;
