import { createMultipleTypes } from '@/functions/createTypes';
import { Radio, RadioFeedback } from '@fairgarden/design/forms/radio';
import { RadioGroup } from '@fairgarden/design/forms/radio-group';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Radio,
  RadioGroup,
  RadioFeedback,
});

export const TypesRadio = types;
export const TypesRadioAdditional = AdditionalTypes;
