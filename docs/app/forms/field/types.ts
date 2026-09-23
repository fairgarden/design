import { createMultipleTypes } from '@/functions/createTypes';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@fairgarden/design/forms/field';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
});

export const TypesField = types;
export const TypesFieldAdditional = AdditionalTypes;
