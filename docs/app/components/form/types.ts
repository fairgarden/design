import { createMultipleTypes } from '@/functions/createTypes';
import {
  Form,
  FormSummary,
  FormRow,
  FormActions,
} from '@fairgarden-private/design/components/Form';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Form,
  FormSummary,
  FormRow,
  FormActions,
});

export const TypesForm = types;
export const TypesFormAdditional = AdditionalTypes;
