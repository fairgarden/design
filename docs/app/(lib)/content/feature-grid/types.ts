import { createMultipleTypes } from '@/functions/createTypes';
import {
  FeatureGrid,
  FeatureGridHeader,
  FeatureGridList,
  FeatureGridCell,
  FeatureGridIcon,
  FeatureGridDrawing,
  FeatureGridHeading,
  FeatureGridLink,
  FeatureGridBody,
} from '@fairgarden/design/content/feature-grid';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  FeatureGrid,
  FeatureGridHeader,
  FeatureGridList,
  FeatureGridCell,
  FeatureGridIcon,
  FeatureGridDrawing,
  FeatureGridHeading,
  FeatureGridLink,
  FeatureGridBody,
});

export const TypesFeatureGrid = types;
export const TypesFeatureGridAdditional = AdditionalTypes;
