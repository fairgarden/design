import { createDemo } from '@/functions/createDemo';
import { CodeBlockServer } from './CodeBlockServer';

export const DemoCodeBlockServer = createDemo(import.meta.url, CodeBlockServer, {
  name: 'Highlighted on the server',
  slug: 'highlighted-on-the-server',
});
