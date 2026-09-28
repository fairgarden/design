import { createMultipleTypes } from '@/functions/createTypes';
import { SearchDialog } from '@fairgarden/design/overlays/search-dialog';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  SearchDialog,
});

export const TypesSearchDialog = types;
export const TypesSearchDialogAdditional = AdditionalTypes;
