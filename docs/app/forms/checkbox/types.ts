import { createMultipleTypes } from '@/functions/createTypes';
import { Checkbox } from '@fairgarden/design/forms/checkbox';
import { CheckboxGroup } from '@fairgarden/design/forms/checkbox-group';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Checkbox,
  CheckboxGroup,
});

export const TypesCheckbox = types;
export const TypesCheckboxAdditional = AdditionalTypes;
