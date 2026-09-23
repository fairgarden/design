import { createMultipleTypes } from '@/functions/createTypes';
import { SpecList, SpecListItem } from '@fairgarden-private/design/components/SpecList';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  SpecList,
  SpecListItem,
});

export const TypesSpecList = types;
export const TypesSpecListAdditional = AdditionalTypes;
