import { createDemo } from '@/functions/createDemo';
import { SpecSheetKinds } from './SpecSheetKinds';

export const DemoSpecSheetKinds = createDemo(import.meta.url, SpecSheetKinds, {
  name: 'Leader, form box and manual',
  slug: 'kinds',
});
