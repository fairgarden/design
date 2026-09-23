import { createMultipleTypes } from '@/functions/createTypes';
import { SpecGrid, SpecGridItem } from '@fairgarden-private/design/components/SpecGrid';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  SpecGrid,
  SpecGridItem,
});

export const TypesSpecGrid = types;
export const TypesSpecGridAdditional = AdditionalTypes;
