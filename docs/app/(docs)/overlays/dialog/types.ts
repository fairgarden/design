import { createMultipleTypes } from '@/functions/createTypes';
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogTopBar,
  DialogEyebrow,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogDescription,
  DialogActions,
} from '@fairgarden/design/overlays/dialog';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogTopBar,
  DialogEyebrow,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogDescription,
  DialogActions,
});

export const TypesDialog = types;
export const TypesDialogAdditional = AdditionalTypes;
