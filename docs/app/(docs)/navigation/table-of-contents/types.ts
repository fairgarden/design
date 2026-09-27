import { createMultipleTypes } from '@/functions/createTypes';
import { TableOfContents, useActiveHeading } from '@fairgarden/design/navigation/table-of-contents';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  TableOfContents,
  useActiveHeading,
});

export const TypesTableOfContents = types;
export const TypesTableOfContentsAdditional = AdditionalTypes;
