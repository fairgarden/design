/** A sitemap page path (`./button/page.mdx`) under a section prefix (`/actions/`), as a route. */
export function toHref(prefix: string, path = '') {
  const href = (prefix + path.replace(/^\.\//, '').replace(/\/?page\.mdx$/, '')).replace(/\/$/, '')
  return href || '/'
}
