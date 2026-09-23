/*
 * The print URL rules (§7.6), shared by Link and Section Header. Not
 * exported from any index.
 */

/** Query parameters dropped when a URL is cleaned for print (§7.6). */
const TRACKING_PARAM = /^(utm_.+|fbclid|gclid|msclkid|mc_cid|mc_eid)$/i

/** The longest cleaned URL printed inline after its link (§7.6.1). */
const PRINT_URL_MAX = 30

/**
 * An absolute URL cleaned per §7.6: no protocol, `www.`, tracking
 * parameters or trailing slash. Relative or malformed URLs return null.
 */
export function cleanUrl(href: string): string | null {
  if (!/^https?:\/\//i.test(href)) return null
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAM.test(key)) url.searchParams.delete(key)
  }
  const host = url.host.replace(/^www\./i, '')
  const path = url.pathname.replace(/\/+$/, '')
  return `${host}${path}${url.search}${url.hash}`
}

/**
 * The short URL printed after a link, "Label (short URL)" (§7.6.1): the
 * cleaned URL, for absolute URLs of at most 30 cleaned characters. Longer
 * or relative URLs return null: they take a lettered link note, which the
 * page collects.
 */
export function printUrl(href: unknown): string | null {
  if (typeof href !== 'string') return null
  const cleaned = cleanUrl(href)
  return cleaned === null || cleaned.length > PRINT_URL_MAX ? null : cleaned
}
