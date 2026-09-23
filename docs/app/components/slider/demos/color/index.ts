import { createDemo } from '@/functions/createDemo';
import { SliderColor } from './SliderColor';

export const DemoSliderColor = createDemo(import.meta.url, SliderColor, {
  name: 'Primary scale',
  slug: 'color',
});
