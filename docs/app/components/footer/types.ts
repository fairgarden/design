import { createMultipleTypes } from '@/functions/createTypes';
import { Footer, FooterBlock } from '@fairgarden-private/design/components/Footer';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Footer,
  FooterBlock,
});

export const TypesFooter = types;
export const TypesFooterAdditional = AdditionalTypes;
