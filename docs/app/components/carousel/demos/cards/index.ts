import { createDemo } from '@/functions/createDemo';
import { CarouselCards } from './CarouselCards';

export const DemoCarouselCards = createDemo(import.meta.url, CarouselCards, {
  name: 'Card carousels',
  slug: 'cards',
});
