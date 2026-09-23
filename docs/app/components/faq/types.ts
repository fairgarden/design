import { createMultipleTypes } from '@/functions/createTypes';
import {
  FAQ,
  FAQHeader,
  FAQTitle,
  FAQIntro,
  FAQList,
  FAQItem,
  FAQContact,
} from '@fairgarden-private/design/components/FAQ';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  FAQ,
  FAQHeader,
  FAQTitle,
  FAQIntro,
  FAQList,
  FAQItem,
  FAQContact,
});

export const TypesFAQ = types;
export const TypesFAQAdditional = AdditionalTypes;
