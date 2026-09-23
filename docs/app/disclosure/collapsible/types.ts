import { createMultipleTypes } from '@/functions/createTypes';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  DisclosureGlyph,
} from '@fairgarden/design/disclosure/collapsible';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  DisclosureGlyph,
});

export const TypesCollapsible = types;
export const TypesCollapsibleAdditional = AdditionalTypes;
