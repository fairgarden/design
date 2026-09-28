import { createMultipleTypes } from '@/functions/createTypes';
import { ToastProvider, useToastManager } from '@fairgarden/design/feedback/toast';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  ToastProvider,
  useToastManager,
});

export const TypesToast = types;
export const TypesToastAdditional = AdditionalTypes;
