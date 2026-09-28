import { createMultipleTypes } from '@/functions/createTypes';
import { StatBlock, Stat } from '@fairgarden/design/data/stat';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  StatBlock,
  Stat,
});

export const TypesStat = types;
export const TypesStatAdditional = AdditionalTypes;
