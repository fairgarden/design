import { createMultipleTypes } from '@/functions/createTypes';
import { Slider } from '@fairgarden/design/forms/slider';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Slider,
});

export const TypesSlider = types;
export const TypesSliderAdditional = AdditionalTypes;
