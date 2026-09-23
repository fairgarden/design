import { createMultipleTypes } from '@/functions/createTypes';
import { Badge, StatusGlyph } from '@fairgarden-private/design/components/Badge';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Badge,
  StatusGlyph,
});

export const TypesBadge = types;
export const TypesBadgeAdditional = AdditionalTypes;
