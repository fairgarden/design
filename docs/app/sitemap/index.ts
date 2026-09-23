import { createSitemap } from '@fairgarden/docs/createSitemap';
import Overview from '../overview/page.mdx';
import Foundations from '../foundations/page.mdx';
import Actions from '../actions/page.mdx';
import Navigation from '../navigation/page.mdx';
import Forms from '../forms/page.mdx';
import Feedback from '../feedback/page.mdx';
import Overlays from '../overlays/page.mdx';
import Disclosure from '../disclosure/page.mdx';
import Page from '../page/page.mdx';
import Content from '../content/page.mdx';
import Data from '../data/page.mdx';

// Sections in navigation order; each import is an auto-maintained index.
// (Semicolons kept: the sitemap loader's import parser expects them.)
export const sitemap = createSitemap(import.meta.url, {
  Overview, Foundations, Actions, Navigation, Forms, Feedback, Overlays, Disclosure, Page, Content, Data,
});
