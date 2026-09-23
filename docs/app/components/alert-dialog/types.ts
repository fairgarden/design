import { createMultipleTypes } from '@/functions/createTypes';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogBody,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogActions,
  AlertDialogCancel,
} from '@fairgarden-private/design/components/AlertDialog';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogBody,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogActions,
  AlertDialogCancel,
});

export const TypesAlertDialog = types;
export const TypesAlertDialogAdditional = AdditionalTypes;
