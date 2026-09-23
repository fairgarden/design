import { createDemo } from '@/functions/createDemo';
import { PaginationForms } from './PaginationForms';

export const DemoPaginationForms = createDemo(import.meta.url, PaginationForms, {
  name: 'Numbered, compact, step, dots and more',
  slug: 'forms',
});
