import * as React from 'react'

/*
 * What a page frame tells the parts it composes (§11) [D202]. The docs
 * layout renders the page's skip link itself, first in the page and aimed
 * at its own `main`, so the Navigation Bar in its header renders none and
 * the page has exactly one.
 */

/** `true` inside a page frame that renders the page's skip link (the docs layout). */
export const SkipLinkContext = React.createContext(false)
SkipLinkContext.displayName = 'SkipLinkContext'
