import { createMultipleTypes } from '@/functions/createTypes';
import {
  Fieldset,
  FieldsetLegend,
  FieldsetLeader,
} from '@fairgarden/design/forms/fieldset';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Fieldset,
  FieldsetLegend,
  FieldsetLeader,
});

export const TypesFieldset = types;
export const TypesFieldsetAdditional = AdditionalTypes;
