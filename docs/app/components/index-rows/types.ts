import { createMultipleTypes } from '@/functions/createTypes';
import {
  IndexRows,
  IndexRowsHeader,
  IndexRowsList,
  IndexRow,
  IndexRowTitle,
  IndexRowTitleLink,
  IndexRowCount,
  IndexRowMeta,
  IndexRowDek,
  IndexRowDisclosure,
  IndexRowsFooter,
} from '@fairgarden-private/design/components/IndexRows';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  IndexRows,
  IndexRowsHeader,
  IndexRowsList,
  IndexRow,
  IndexRowTitle,
  IndexRowTitleLink,
  IndexRowCount,
  IndexRowMeta,
  IndexRowDek,
  IndexRowDisclosure,
  IndexRowsFooter,
});

export const TypesIndexRows = types;
export const TypesIndexRowsAdditional = AdditionalTypes;
