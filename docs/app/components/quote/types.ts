import { createMultipleTypes } from '@/functions/createTypes';
import {
  Quote,
  QuoteText,
  QuoteAttribution,
  QuoteName,
  QuoteRole,
  QuotePortrait,
  QuoteSource,
} from '@fairgarden-private/design/components/Quote';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Quote,
  QuoteText,
  QuoteAttribution,
  QuoteName,
  QuoteRole,
  QuotePortrait,
  QuoteSource,
});

export const TypesQuote = types;
export const TypesQuoteAdditional = AdditionalTypes;
