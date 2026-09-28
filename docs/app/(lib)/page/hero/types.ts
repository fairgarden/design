import { createMultipleTypes } from '@/functions/createTypes';
import { Hero, HeroLockup } from '@fairgarden/design/page/hero';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Hero,
  HeroLockup,
});

export const TypesHero = types;
export const TypesHeroAdditional = AdditionalTypes;
