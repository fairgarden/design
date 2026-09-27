import { createMultipleTypes } from '@/functions/createTypes';
import { Map } from '@fairgarden/design/data/map';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Map,
});

export const TypesMap = types;
export const TypesMapAdditional = AdditionalTypes;
