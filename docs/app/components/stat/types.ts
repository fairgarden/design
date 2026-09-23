import { createMultipleTypes } from '@/functions/createTypes';
import { StatBlock, Stat } from '@fairgarden-private/design/components/Stat';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  StatBlock,
  Stat,
});

export const TypesStat = types;
export const TypesStatAdditional = AdditionalTypes;
