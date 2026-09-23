# FairGarden Design System

<!-- fg:version -->

Version **0.1.0-alpha.0**

<!-- /fg:version -->

<!-- fg:releasing -->

## Releasing

This module releases on its own. `0.1.0-alpha.0` is what main is working towards,
not what is published — the version here is always the next one.

1. **Publish it.** Run the *Publish* workflow from the Actions tab, picking the
   dist tag. It refuses if that version is already on npm.
2. **Move it on.** `pnpm release` — opens a pull request bumping this branch
   to `0.1.0-alpha.1`, or `pnpm release --id rc` to change
   identifier. A prerelease gets no maintenance branch; there is no released
   line behind it yet.

Every push to main publishes `@fairgarden-private/design@canary`. A canary is not a release and
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
pnpm add @fairgarden-private/design @base-ui/react
# only for Map:
pnpm add maplibre-gl pmtiles @protomaps/basemaps
```

```tsx
// app shell, once
import '@fairgarden-private/design/utils/global.css'
import '@fairgarden-private/design/utils/fonts'
import { ClientProvider } from '@fairgarden-private/design/utils/ClientProvider'

// anywhere
import { Button } from '@fairgarden-private/design/components/Button'

<ClientProvider locale="en-US">
  <Button variant="solid">Sign Up</Button>
</ClientProvider>
```

Each component is imported from its own path, `@fairgarden-private/design/components/<Name>`.

## Components

**Foundations:** Ground, Icon, Separator, Sticker, and the shared utilities: patterns (`utils/pattern.module.css`), type roles (`utils/type.module.css`), lines, ornaments and the navigation data type (`utils/navigation`).

**Actions and navigation:** Button, Link, Toggle and Toggle Group, Tabs, Navigation Menu, Menu, Context Menu, Menubar, Breadcrumb, Pagination, Search, Toolbar.

**Forms:** Form, Field, Fieldset, Input, Number Field, Select, Combobox, Autocomplete, Checkbox and Checkbox Group, Radio and Radio Group, Switch, Slider.

**Status and overlays:** Alert, Badge, Tag, Chip, Avatar, Accordion, Collapsible, Dialog, Alert Dialog, Popover, Preview Card, Tooltip, Toast, Progress, Meter, Scroll Area.

**Page frame:** Navigation Bar, Nav Drawer, Section Bar, Announcement Bar, Section Header, Section Divider, Hero, CTA Block, Newsletter, Marquee, Footer.

**Content modules:** Card, Card Grid, Carousel, FAQ, Feature Grid, Spec Sheet, Quote, Pricing, Stat, Index Rows, Timeline, Profile, Empty State.

**Data:** Table, Spec List, Spec Grid, Figure, Chart, Map.

## Development

- `pnpm --filter @fairgarden-private/design build`: generates the color and icon files, the CSS Module typings, then compiles with `tsc` and PostCSS into `components/`, `utils/` and `icons/`.
- `pnpm --filter @fairgarden-private/design lint`
- Documentation site in `docs/` (`@fairgarden-private/design-docs`, port 3032): `pnpm --filter @fairgarden-private/design-docs dev`. It compiles `src/` directly through tsconfig paths. After changing a component's props or adding a page, run `pnpm validate` in `docs/` to regenerate the `types.md` files and the page indexes.

Install dependencies from the monorepo root only. The full specification lives outside this repository (`DESIGN-SYSTEM.md`).
