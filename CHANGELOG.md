# Changelog

## 0.1.0-alpha.2

- `utils/docs` builds a docs site on `@fairgarden/docs`, an optional peer: `createDemo`, `createTypes` and `createMdxComponents` render through `CodeBlock`, `Demo`, `TypesTable` and `FileTabs`. Code windows and loading states are in the first paint, so a page doesn't shift as it highlights ([#3](https://github.com/fairgarden/design/pull/3))
- `DocsLayout` lays out a docs site: `SidebarNav` beside the page, or in a drawer on phones; `TableOfContents` as a column from 1440px, or a bar above the page naming the current section; and a `SearchDialog` that expands out of its trigger ([#3](https://github.com/fairgarden/design/pull/3))
- `FileTabs` holds a set of documents in one frame, with optional controls at its side; `CodeBlock` and `Demo` use it ([#3](https://github.com/fairgarden/design/pull/3))
- Menus, selects, popovers (tails included), dialogs and drawers grow out of the control that opened them. `morph={false}` or `--fgd-outline-morph: none` opens and closes them at once instead; overlays no longer wipe in ([#3](https://github.com/fairgarden/design/pull/3))
- A hover or press fill that starts or ends at nothing switches at once, and a press swaps fill and label together, so no frame is see-through or low in contrast ([#3](https://github.com/fairgarden/design/pull/3))
- `Input` takes `chars`, its width in characters, and `Chart` animates only with `animate` ([#3](https://github.com/fairgarden/design/pull/3))
- Pages don't shift as they load: each web font has a fallback matched to its metrics, the page and `wide` and `rail` Scroll Areas always reserve their scrollbar gutter, and `Newsletter`'s card overlaps by a fixed depth ([#3](https://github.com/fairgarden/design/pull/3))
