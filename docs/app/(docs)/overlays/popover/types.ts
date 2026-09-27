import { createMultipleTypes } from '@/functions/createTypes';
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
  PopoverSource,
  PopoverClose,
} from '@fairgarden/design/overlays/popover';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
  PopoverSource,
  PopoverClose,
});

export const TypesPopover = types;
export const TypesPopoverAdditional = AdditionalTypes;
