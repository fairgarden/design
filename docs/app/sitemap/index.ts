import { createSitemap } from '@fairgarden/docs/createSitemap'
import Overview from '../(lib)/overview/page.mdx'
import Foundations from '../(lib)/foundations/page.mdx'
import Actions from '../(lib)/actions/page.mdx'
import Navigation from '../(lib)/navigation/page.mdx'
import Forms from '../(lib)/forms/page.mdx'
import Feedback from '../(lib)/feedback/page.mdx'
import Overlays from '../(lib)/overlays/page.mdx'
import Disclosure from '../(lib)/disclosure/page.mdx'
import Page from '../(lib)/page/page.mdx'
import Content from '../(lib)/content/page.mdx'
import Data from '../(lib)/data/page.mdx'

// Sections in navigation order; each import is an auto-maintained index.
export const sitemap = createSitemap(import.meta.url, {
  Overview, Foundations, Actions, Navigation, Forms, Feedback, Overlays, Disclosure, Page, Content, Data,
})
