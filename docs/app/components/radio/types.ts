import { createMultipleTypes } from '@/functions/createTypes';
import { Radio, RadioFeedback } from '@fairgarden-private/design/components/Radio';
import { RadioGroup } from '@fairgarden-private/design/components/RadioGroup';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Radio,
  RadioGroup,
  RadioFeedback,
});

export const TypesRadio = types;
export const TypesRadioAdditional = AdditionalTypes;
