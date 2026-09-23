import { createMultipleTypes } from '@/functions/createTypes';
import {
  Quote,
  QuoteText,
  QuoteAttribution,
  QuoteName,
  QuoteRole,
  QuotePortrait,
  QuoteSource,
} from '@fairgarden/design/content/quote';

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
