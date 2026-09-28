import { createMultipleTypes } from '@/functions/createTypes';
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
} from '@fairgarden/design/navigation/file-tabs';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  FileTabs,
  FileTabsList,
  FileTabsControl,
  FileTabsPanel,
});

export const TypesFileTabs = types;
export const TypesFileTabsAdditional = AdditionalTypes;
