import { createMultipleTypes } from '@/functions/createTypes';
import {
  Card,
  CardMedia,
  CardKicker,
  CardTitle,
  CardTitleLink,
  CardMeta,
  CardBody,
  CardFooter,
  CardChoice,
} from '@fairgarden/design/content/card';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Card,
  CardMedia,
  CardKicker,
  CardTitle,
  CardTitleLink,
  CardMeta,
  CardBody,
  CardFooter,
  CardChoice,
});

export const TypesCard = types;
export const TypesCardAdditional = AdditionalTypes;
