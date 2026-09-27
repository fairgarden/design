import { createMultipleTypes } from '@/functions/createTypes';
import {
  ExpandingBox,
  ExpandingBoxMain,
  ExpandingBoxExtra,
  useExpandingBoxName,
  startExpandingTransition,
} from '@fairgarden/design/foundations/expanding-box';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  ExpandingBox,
  ExpandingBoxMain,
  ExpandingBoxExtra,
  useExpandingBoxName,
  startExpandingTransition,
});

export const TypesExpandingBox = types;
export const TypesExpandingBoxAdditional = AdditionalTypes;
