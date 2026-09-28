import { createMultipleTypes } from '@/functions/createTypes';
import { Sticker, StickerDetail } from '@fairgarden/design/foundations/sticker';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Sticker,
  StickerDetail,
});

export const TypesSticker = types;
export const TypesStickerAdditional = AdditionalTypes;
