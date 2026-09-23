# FairGarden Design System

<!-- fg:version -->

Version **0.1.0-alpha.2**

<!-- /fg:version -->

<!-- fg:releasing -->

## Releasing

This module releases on its own. `0.1.0-alpha.2` is what main is working towards,
not what is published — the version here is always the next one.

1. **Publish it.** Run the *Publish* workflow from the Actions tab, picking the
   dist tag. It refuses if that version is already on npm.
2. **Move it on.** `pnpm release` — opens a pull request bumping this branch
   to `0.1.0-alpha.3`, or `pnpm release --id rc` to change
   identifier. A prerelease gets no maintenance branch; there is no released
   line behind it yet.

Every push to main publishes `@fairgarden/design@canary`. A canary is not a release and
carries no promise; it is there so main can be tried without a checkout.

<!-- /fg:releasing -->

## Stack

- **React 19** and **Base UI** (`@base-ui/react`, a peer dependency): unstyled, accessible primitives under every interactive component.
- **CSS Modules plus CVA** (`class-variance-authority`): one module per component, one class per variant value, typed variant axes, all in cascade layers (`reset, tokens, theme, roles, base, variants, compounds, scales, states, print`).
- **Open Props** for the non-color tokens, plus the system's own `--ds-*` extensions. Text sizes are in rem, spacing in px.
- **Radix Colors**: the 31 standard scales as one unified `--{scale}{step}` set (no alpha scales). Light and dark swap the values, never the names: `data-theme="light|dark"` on `html` forces a mode, otherwise the OS `prefers-color-scheme` decides. Components read only scale steps and role variables (`--primary1…12`, `--secondary1…12`, `--role-*`) and never see the mode. Every component takes `primary` and `secondary` scale props; grounds (`Ground`: 8 page grounds, the `night` band, 7 fields) set them for a region.
- **Material Symbols** (Rounded, FILL 0 by default) compiled to inline SVG paths by `scripts/build-icons.js`; no icon font.
- **Recharts** for charts (SVG, role colors, opaque fills, pattern defs, no animation unless motion is allowed).
- **MapLibre GL + Protomaps + OpenStreetMap** for maps: `maplibre-gl`, `pmtiles` and `@protomaps/basemaps` are optional peer dependencies, loaded dynamically by `Map`. Install them only if you use it.
- **Fonts** (SIL OFL, self-hosted via Fontsource): Fraunces, Source Serif 4, Figtree and IBM Plex Mono.
- **PostCSS** (`postcss-import`, `@csstools/postcss-global-data`, `postcss-custom-media`), TypeScript, ESLint and Prettier.

## Usage

```bash
pnpm add @fairgarden/design @base-ui/react
# only for Map:
pnpm add maplibre-gl pmtiles @protomaps/basemaps
```

```tsx
// app shell, once
import '@fairgarden/design/utils/global.css'
import '@fairgarden/design/utils/fonts'
import { ClientProvider } from '@fairgarden/design/utils/ClientProvider'

// anywhere
import { Button } from '@fairgarden/design/actions/button'

<ClientProvider locale="en-US">
  <Button variant="solid">Sign Up</Button>
</ClientProvider>
```

Each component is imported from its own path, `@fairgarden/design/<category>/<name>`: the category folder, then the component's name in kebab case (`@fairgarden/design/forms/number-field` exports `NumberField`). The shared utilities stay at `@fairgarden/design/utils/<name>` and the generated icon paths at `@fairgarden/design/icons/paths`.

## Components

| Category | Components (import path `@fairgarden/design/<category>/…`) |
| --- | --- |
| `foundations` | Ground (`ground`), Icon (`icon`), Separator (`separator`), Sticker (`sticker`) |
| `actions` | Button (`button`), Link (`link`), Toggle (`toggle`), Toggle Group (`toggle-group`), Chip (`chip`) |
| `navigation` | Navigation Menu (`navigation-menu`), Navigation Bar (`navigation-bar`), Nav Drawer (`nav-drawer`), Breadcrumb (`breadcrumb`), Pagination (`pagination`), Tabs (`tabs`), Toolbar (`toolbar`) |
| `forms` | Field (`field`), Fieldset (`fieldset`), Form (`form`), Input (`input`), Number Field (`number-field`), Select (`select`), Combobox (`combobox`), Autocomplete (`autocomplete`), Search (`search`), Checkbox (`checkbox`), Checkbox Group (`checkbox-group`), Radio (`radio`), Radio Group (`radio-group`), Switch (`switch`), Slider (`slider`) |
| `feedback` | Alert (`alert`), Badge (`badge`), Tag (`tag`), Avatar (`avatar`), Progress (`progress`), Meter (`meter`), Toast (`toast`) |
| `overlays` | Dialog (`dialog`), Alert Dialog (`alert-dialog`), Popover (`popover`), Preview Card (`preview-card`), Menu (`menu`), Context Menu (`context-menu`), Menubar (`menubar`), Tooltip (`tooltip`) |
| `disclosure` | Accordion (`accordion`), Collapsible (`collapsible`), FAQ (`faq`) |
| `page` | Hero (`hero`), Footer (`footer`), Section Bar (`section-bar`), Section Divider (`section-divider`), Section Header (`section-header`), CTA Block (`cta-block`), Newsletter (`newsletter`), Marquee (`marquee`), Announcement Bar (`announcement-bar`) |
| `content` | Card (`card`), Card Grid (`card-grid`), Feature Grid (`feature-grid`), Carousel (`carousel`), Quote (`quote`), Index Rows (`index-rows`), Profile (`profile`), Pricing (`pricing`), Timeline (`timeline`), Empty State (`empty-state`) |
| `data` | Table (`table`), Scroll Area (`scroll-area`), Spec Grid (`spec-grid`), Spec List (`spec-list`), Spec Sheet (`spec-sheet`), Figure (`figure`), Stat (`stat`), Chart (`chart`), Map (`map`) |

**Utilities** (`@fairgarden/design/utils/…`): the global stylesheet (`global.css`), the fonts (`fonts`), `ClientProvider`, the pattern tiles (`pattern.module.css`), the type roles (`type.module.css`), the line styles (`line.module.css`), ornaments (`Ornament`) and the navigation data type (`navigation`).

## Development

- `pnpm --filter @fairgarden/design build`: generates the color and icon files, the CSS Module typings, then compiles `src/` with `tsc` and PostCSS into one folder per category (`foundations/`, `actions/` … `data/`), `utils/` and `icons/` at the package root.
- `pnpm --filter @fairgarden/design lint`
- Source layout: `src/<category>/<name>/` holds `<Name>.tsx`, `<name>.module.css` (with its generated `.d.ts`) and `index.ts`; the shared utilities are in `src/utils/` and the generated icons in `src/icons/`.
- Documentation site in `docs/` (`@fairgarden/design-docs`, port 3032): `pnpm --filter @fairgarden/design-docs dev`. It compiles `src/` directly through tsconfig paths, with one section per category (`docs/app/<category>/<name>/`). After changing a component's props or adding a page, run `pnpm validate` in `docs/` to regenerate the `types.md` files and the section indexes.

Install dependencies from the monorepo root only. The full specification lives outside this repository (`DESIGN-SYSTEM.md`).
