import { createDemo } from '@/functions/createDemo';
import { CarouselPhotos } from './CarouselPhotos';

export const DemoCarouselPhotos = createDemo(import.meta.url, CarouselPhotos, {
  name: 'Photo carousel',
  slug: 'photos',
});
