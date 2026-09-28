import { createDemoWithVariants } from '@/functions/createDemo';
import { SeedlingCounter as CssModules } from './css-modules/SeedlingCounter';
import { SeedlingCounter as Tag } from './tag/SeedlingCounter';

export const DemoDemoVariants = createDemoWithVariants(
  import.meta.url,
  { CssModules, Tag },
  { name: 'Variants', slug: 'variants' },
);
