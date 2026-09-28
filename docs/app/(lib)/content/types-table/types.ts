import { createMultipleTypes } from '@/functions/createTypes';
import { TypesTable, TypePre } from '@fairgarden/design/content/types-table';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  TypesTable,
  TypePre,
});

export const TypesTypesTable = types;
export const TypesTypesTableAdditional = AdditionalTypes;
