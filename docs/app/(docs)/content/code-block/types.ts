import { createMultipleTypes } from '@/functions/createTypes';
import { CodeBlock, CodeBlockLoading } from '@fairgarden/design/content/code-block';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  CodeBlock,
  CodeBlockLoading,
});

export const TypesCodeBlock = types;
export const TypesCodeBlockAdditional = AdditionalTypes;
