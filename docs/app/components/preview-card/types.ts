import { createMultipleTypes } from '@/functions/createTypes';
import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPopup,
  PreviewCardArrow,
  PreviewCardThumb,
  PreviewCardTitle,
  PreviewCardDescription,
  PreviewCardDomain,
} from '@fairgarden-private/design/components/PreviewCard';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPopup,
  PreviewCardArrow,
  PreviewCardThumb,
  PreviewCardTitle,
  PreviewCardDescription,
  PreviewCardDomain,
});

export const TypesPreviewCard = types;
export const TypesPreviewCardAdditional = AdditionalTypes;
