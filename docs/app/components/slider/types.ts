import { createMultipleTypes } from '@/functions/createTypes';
import { Slider } from '@fairgarden-private/design/components/Slider';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Slider,
});

export const TypesSlider = types;
export const TypesSliderAdditional = AdditionalTypes;
