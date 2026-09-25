import { createMultipleTypes } from '@/functions/createTypes';
import {
  createDemoFactory,
  createDemoWithVariantsFactory,
  createTypesFactory,
  createMultipleTypesFactory,
  createMdxComponents,
  DemoTitle,
  Pre,
} from '@fairgarden/design/utils/docs';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  createDemoFactory,
  createDemoWithVariantsFactory,
  createTypesFactory,
  createMultipleTypesFactory,
  createMdxComponents,
  DemoTitle,
  Pre,
});

export const TypesDocsUtilities = types;
export const TypesDocsUtilitiesAdditional = AdditionalTypes;
