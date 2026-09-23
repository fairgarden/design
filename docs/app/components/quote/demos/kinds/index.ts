import { createDemo } from '@/functions/createDemo';
import { QuoteKinds } from './QuoteKinds';

export const DemoQuoteKinds = createDemo(import.meta.url, QuoteKinds, {
  name: 'Kinds',
  slug: 'kinds',
});
