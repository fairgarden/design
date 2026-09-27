import { createSitemap } from '@fairgarden/docs/createSitemap'
import Overview from '../(docs)/overview/page.mdx'
import Foundations from '../(docs)/foundations/page.mdx'
import Actions from '../(docs)/actions/page.mdx'
import Navigation from '../(docs)/navigation/page.mdx'
import Forms from '../(docs)/forms/page.mdx'
import Feedback from '../(docs)/feedback/page.mdx'
import Overlays from '../(docs)/overlays/page.mdx'
import Disclosure from '../(docs)/disclosure/page.mdx'
import Page from '../(docs)/page/page.mdx'
import Content from '../(docs)/content/page.mdx'
import Data from '../(docs)/data/page.mdx'

// Sections in navigation order; each import is an auto-maintained index.
export const sitemap = createSitemap(import.meta.url, {
  Overview, Foundations, Actions, Navigation, Forms, Feedback, Overlays, Disclosure, Page, Content, Data,
})
