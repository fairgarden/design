import { createMultipleTypes } from '@/functions/createTypes';
import {
  EmptyState,
  EmptyStateDrawing,
  EmptyStateTrail,
  EmptyStateHeading,
  EmptyStateText,
  EmptyStateAction,
} from '@fairgarden/design/content/empty-state';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  EmptyState,
  EmptyStateDrawing,
  EmptyStateTrail,
  EmptyStateHeading,
  EmptyStateText,
  EmptyStateAction,
});

export const TypesEmptyState = types;
export const TypesEmptyStateAdditional = AdditionalTypes;
