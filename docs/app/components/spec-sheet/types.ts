import { createMultipleTypes } from '@/functions/createTypes';
import {
  SpecSheet,
  SpecGridItem,
  SpecListItem,
} from '@fairgarden-private/design/components/SpecSheet';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  SpecSheet,
  SpecGridItem,
  SpecListItem,
});

export const TypesSpecSheet = types;
export const TypesSpecSheetAdditional = AdditionalTypes;
