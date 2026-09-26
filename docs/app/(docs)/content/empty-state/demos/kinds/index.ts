import { createDemo } from '@/functions/createDemo';
import { EmptyStateKinds } from './EmptyStateKinds';

export const DemoEmptyStateKinds = createDemo(import.meta.url, EmptyStateKinds, {
  name: 'Kinds',
  slug: 'kinds',
});
