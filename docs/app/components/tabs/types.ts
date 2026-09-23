import { createMultipleTypes } from '@/functions/createTypes';
import {
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
} from '@fairgarden-private/design/components/Tabs';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
});

export const TypesTabs = types;
export const TypesTabsAdditional = AdditionalTypes;
