// Self-hosted SIL OFL webfonts (§1.5.5) [D159]. Import once in the app shell;
// listed in package.json sideEffects so bundlers keep it.
//
// No layout shift at the swap [D201]: the metric-matched fallback faces
// (font-fallbacks.css) hold every line's width and height until a webfont
// arrives, and the app shell preloads the four core faces, the Latin files
// the first screen needs, so they usually arrive before the first paint:
//   @fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2
//   @fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2
//   @fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2
//   @fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2
// (`<link rel="preload" as="font" type="font/woff2" crossorigin>`, at the URL
// the app's bundler gives each file; the docs app's root layout shows how).
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/source-serif-4/opsz.css'
import '@fontsource-variable/source-serif-4/opsz-italic.css'
import '@fontsource-variable/figtree/wght.css'
import '@fontsource-variable/figtree/wght-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/700.css' // bold mono: Pagination's page number
import './font-fallbacks.css'

export {}
