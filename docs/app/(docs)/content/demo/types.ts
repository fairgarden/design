import { createMultipleTypes } from '@/functions/createTypes';
import { DemoContent, DemoLoading } from '@fairgarden/design/content/demo';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  DemoContent,
  DemoLoading,
});

export const TypesDemo = types;
export const TypesDemoAdditional = AdditionalTypes;
