import { createMultipleTypes } from '@/functions/createTypes';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipPopup,
} from '@fairgarden/design/overlays/tooltip';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
});

export const TypesTooltip = types;
export const TypesTooltipAdditional = AdditionalTypes;
