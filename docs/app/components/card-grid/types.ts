import { createMultipleTypes } from '@/functions/createTypes';
import {
  CardGrid,
  CardGridHeader,
  CardGridToolbar,
  CardGridCount,
  CardGridList,
  CardGridItem,
  CardGridFooter,
  CardGridFooterLink,
} from '@fairgarden-private/design/components/CardGrid';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  CardGrid,
  CardGridHeader,
  CardGridToolbar,
  CardGridCount,
  CardGridList,
  CardGridItem,
  CardGridFooter,
  CardGridFooterLink,
});

export const TypesCardGrid = types;
export const TypesCardGridAdditional = AdditionalTypes;
