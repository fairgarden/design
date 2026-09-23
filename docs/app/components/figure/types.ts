import { createMultipleTypes } from '@/functions/createTypes';
import { Figure, FigureMedia, FigureCaption } from '@fairgarden-private/design/components/Figure';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Figure,
  FigureMedia,
  FigureCaption,
});

export const TypesFigure = types;
export const TypesFigureAdditional = AdditionalTypes;
