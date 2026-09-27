import { createDemo } from '@/functions/createDemo';
import { DocsLayoutHandbook } from './DocsLayoutHandbook';

export const DemoDocsLayoutHandbook = createDemo(import.meta.url, DocsLayoutHandbook, {
  name: 'A handbook page',
  slug: 'handbook',
});
