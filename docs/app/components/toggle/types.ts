import { createMultipleTypes } from '@/functions/createTypes';
import { Toggle } from '@fairgarden-private/design/components/Toggle';
import { ToggleGroup } from '@fairgarden-private/design/components/ToggleGroup';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Toggle,
  ToggleGroup,
});

export const TypesToggle = types;
export const TypesToggleAdditional = AdditionalTypes;
