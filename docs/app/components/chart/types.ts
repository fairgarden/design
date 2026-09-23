import { createMultipleTypes } from '@/functions/createTypes';
import { Chart } from '@fairgarden-private/design/components/Chart';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Chart,
});

export const TypesChart = types;
export const TypesChartAdditional = AdditionalTypes;
