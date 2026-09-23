import { createSitemap } from '@fairgarden/docs/createSitemap';
import Overview from '../overview/page.mdx';
import Components from '../components/page.mdx';

// Sections in navigation order; each import is an auto-maintained index.
// (Semicolons kept: the sitemap loader's import parser expects them.)
export const sitemap = createSitemap(import.meta.url, { Overview, Components });
