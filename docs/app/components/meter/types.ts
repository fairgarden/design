import { createMultipleTypes } from '@/functions/createTypes';
import { Meter, MeterPanel } from '@fairgarden-private/design/components/Meter';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Meter,
  MeterPanel,
});

export const TypesMeter = types;
export const TypesMeterAdditional = AdditionalTypes;
