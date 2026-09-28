import { createMultipleTypes } from '@/functions/createTypes';
import { DocsLayout, DocsLayoutDrawer } from '@fairgarden/design/page/docs-layout';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  DocsLayout,
  DocsLayoutDrawer,
});

export const TypesDocsLayout = types;
export const TypesDocsLayoutAdditional = AdditionalTypes;
