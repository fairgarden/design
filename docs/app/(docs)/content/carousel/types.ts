import { createMultipleTypes } from '@/functions/createTypes';
import {
  Carousel,
  CarouselSlide,
  CarouselPhoto,
} from '@fairgarden/design/content/carousel';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Carousel,
  CarouselSlide,
  CarouselPhoto,
});

export const TypesCarousel = types;
export const TypesCarouselAdditional = AdditionalTypes;
