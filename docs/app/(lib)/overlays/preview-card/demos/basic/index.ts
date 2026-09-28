import { createDemo } from '@/functions/createDemo';
import { PreviewCardBasic } from './PreviewCardBasic';

export const DemoPreviewCardBasic = createDemo(import.meta.url, PreviewCardBasic, {
  name: 'A link preview',
  slug: 'basic',
});
