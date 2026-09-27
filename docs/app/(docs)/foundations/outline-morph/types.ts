import { createMultipleTypes } from '@/functions/createTypes';
import {
  useOutlineMorph,
  OutlineMorphFrame,
  OutlineMorphTail,
  OutlineMorphLayer,
  canOutlineMorph,
} from '@fairgarden/design/foundations/outline-morph';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  useOutlineMorph,
  OutlineMorphFrame,
  OutlineMorphTail,
  OutlineMorphLayer,
  canOutlineMorph,
});

export const TypesOutlineMorph = types;
export const TypesOutlineMorphAdditional = AdditionalTypes;
