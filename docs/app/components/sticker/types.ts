import { createMultipleTypes } from '@/functions/createTypes';
import { Sticker, StickerDetail } from '@fairgarden-private/design/components/Sticker';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Sticker,
  StickerDetail,
});

export const TypesSticker = types;
export const TypesStickerAdditional = AdditionalTypes;
