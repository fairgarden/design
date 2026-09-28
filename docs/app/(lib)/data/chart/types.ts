import { createMultipleTypes } from '@/functions/createTypes';
import { Chart } from '@fairgarden/design/data/chart';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Chart,
});

export const TypesChart = types;
export const TypesChartAdditional = AdditionalTypes;
