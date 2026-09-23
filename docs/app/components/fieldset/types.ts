import { createMultipleTypes } from '@/functions/createTypes';
import {
  Fieldset,
  FieldsetLegend,
  FieldsetLeader,
} from '@fairgarden-private/design/components/Fieldset';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Fieldset,
  FieldsetLegend,
  FieldsetLeader,
});

export const TypesFieldset = types;
export const TypesFieldsetAdditional = AdditionalTypes;
