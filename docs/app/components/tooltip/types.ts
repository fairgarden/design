import { createMultipleTypes } from '@/functions/createTypes';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipPopup,
} from '@fairgarden-private/design/components/Tooltip';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
});

export const TypesTooltip = types;
export const TypesTooltipAdditional = AdditionalTypes;
