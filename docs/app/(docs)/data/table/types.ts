import { createMultipleTypes } from '@/functions/createTypes';
import {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@fairgarden/design/data/table';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeaderCell,
  TableCell,
});

export const TypesTable = types;
export const TypesTableAdditional = AdditionalTypes;
