import { createMultipleTypes } from '@/functions/createTypes';
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectSeparator,
} from '@fairgarden/design/forms/select';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Select,
  SelectItem,
  SelectGroup,
  SelectSeparator,
});

export const TypesSelect = types;
export const TypesSelectAdditional = AdditionalTypes;
