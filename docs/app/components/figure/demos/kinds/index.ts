import { createDemo } from '@/functions/createDemo';
import { FigureKinds } from './FigureKinds';

export const DemoFigureKinds = createDemo(import.meta.url, FigureKinds, {
  name: 'Photo, technical figure and plate',
  slug: 'kinds',
});
