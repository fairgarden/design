import { createMultipleTypes } from '@/functions/createTypes';
import { Accordion, AccordionItem } from '@fairgarden-private/design/components/Accordion';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Accordion,
  AccordionItem,
});

export const TypesAccordion = types;
export const TypesAccordionAdditional = AdditionalTypes;
