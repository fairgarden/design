import { createDemo } from '@/functions/createDemo';
import { CodeBlockBasic } from './CodeBlockBasic';

export const DemoCodeBlockBasic = createDemo(import.meta.url, CodeBlockBasic, {
  name: 'One file',
  slug: 'one-file',
});
