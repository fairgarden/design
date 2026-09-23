import { createMultipleTypes } from '@/functions/createTypes';
import { Checkbox } from '@fairgarden-private/design/components/Checkbox';
import { CheckboxGroup } from '@fairgarden-private/design/components/CheckboxGroup';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Checkbox,
  CheckboxGroup,
});

export const TypesCheckbox = types;
export const TypesCheckboxAdditional = AdditionalTypes;
