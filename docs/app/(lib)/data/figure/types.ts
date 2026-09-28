import { createMultipleTypes } from '@/functions/createTypes';
import { Figure, FigureMedia, FigureCaption } from '@fairgarden/design/data/figure';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Figure,
  FigureMedia,
  FigureCaption,
});

export const TypesFigure = types;
export const TypesFigureAdditional = AdditionalTypes;
