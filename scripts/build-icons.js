// Generates src/icons/paths.ts: the §6.10 UI icon inventory as Material
// Symbols Rounded path data (FILL 0 unless stated), one instance per icon and
// calibrated weight, so each icon renders as its own inline SVG filled in
// currentColor [D166]. No icon font ships.
//
// Calibration (§1.5.12, §6.10) [D166]. Material Symbols are filled outlines,
// so the weight axis carries the stroke tier. The @material-symbols/svg-*
// packages ship opsz 48 only (GRAD 0) on a 960-unit grid; the stem is
// measured here as the thickness of the `remove` bar (a plain horizontal
// stroke) and converted to rendered px at each tier's size. Measured at
// 0.47.5: 100 = 22, 200 = 30.8, 300 = 45.4, 400 = 60, 500 = 68.1, 600 = 79.2,
// 700 = 94 units. Each tier takes the weight whose rendered stem is nearest
// its target stroke; its emphasis instance (§10.1 icon states: hover and
// press) is the weight nearest the next stroke tier at the same size.
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const outFile = path.join(__dirname, '../src/icons/paths.ts')

// name → source file. `expand_more` ships under its canonical Material
// Symbols name `keyboard_arrow_down` (same glyph). `circle` is FILL 1, a
// solid 16 px selection mark that always travels with a second cue (§6.10).
const inventory = {
  search: 'search',
  arrow_forward: 'arrow_forward',
  arrow_upward: 'arrow_upward',
  expand_more: 'keyboard_arrow_down',
  close: 'close',
  remove: 'remove',
  add: 'add',
  check: 'check',
  circle: 'circle-fill',
  chevron_right: 'chevron_right',
  chevron_left: 'chevron_left',
  menu: 'menu',
  more_horiz: 'more_horiz',
  play_arrow: 'play_arrow',
  pause: 'pause',
  download: 'download',
  zoom_in: 'zoom_in',
  zoom_out: 'zoom_out',
  recenter: 'recenter',
  help: 'help',
  mail: 'mail',
}

// Tier → size (px) and target strokes (px): rest = the tier's stroke,
// emphasis = the next stroke tier (§1.5.7). Block's next tier is
// --border-size-2-25, since no icon tier sits above it.
const tiers = {
  inline: { size: 16, rest: 1.25, emphasis: 1.5 }, // --border-size-1-25 → --border-size-1-5
  tag: { size: 20, rest: 1.5, emphasis: 2 }, // --border-size-1-5 → --border-size-2
  block: { size: 36, rest: 2, emphasis: 3 }, // --border-size-2 → --border-size-2-25
}

// The calibrated weights (nearest measured stem to each target; see the
// header). Asserted below against the installed packages.
const calibration = {
  inline: { rest: 600, emphasis: 700 },
  tag: { rest: 500, emphasis: 700 },
  block: { rest: 400, emphasis: 600 },
}

const weights = [
  ...new Set(Object.values(calibration).flatMap((w) => [w.rest, w.emphasis])),
].sort((a, b) => a - b)

const VIEWBOX = '0 -960 960 960'
const GRID = 960
// A rendered stem may miss its target by at most this share: the weights
// come in steps of 100, so an exact match is not available.
const TOLERANCE = 0.15

function roundedDir(weight) {
  const pkg = `@material-symbols/svg-${weight}`
  return path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'rounded')
}

function readPaths(weight, file) {
  const svg = fs.readFileSync(path.join(roundedDir(weight), `${file}.svg`), 'utf8')
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1]
  if (viewBox !== VIEWBOX) {
    throw new Error(`${weight}/${file}.svg: unexpected viewBox ${viewBox}`)
  }
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (!paths.length) throw new Error(`${weight}/${file}.svg: no path data`)
  return paths.join(' ')
}

// Vertical extent of a path's on-curve points. For `remove`, a horizontal
// bar with flat top and bottom edges, this is the stem thickness.
function verticalExtent(d) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/g) ?? []
  const arity = { M: 2, L: 2, H: 1, V: 1, Q: 4, T: 2, C: 6, S: 4, A: 7, Z: 0 }
  let i = 0
  let cmd = ''
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let min = Infinity
  let max = -Infinity
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) cmd = tokens[i++]
    const upper = cmd.toUpperCase()
    const relative = cmd !== upper
    if (upper === 'Z') {
      x = startX
      y = startY
      continue
    }
    const args = tokens.slice(i, i + arity[upper]).map(Number)
    i += arity[upper]
    if (upper === 'H') x = (relative ? x : 0) + args[0]
    else if (upper === 'V') y = (relative ? y : 0) + args[0]
    else {
      x = (relative ? x : 0) + args[args.length - 2]
      y = (relative ? y : 0) + args[args.length - 1]
    }
    if (upper === 'M') {
      startX = x
      startY = y
      cmd = relative ? 'l' : 'L'
    }
    min = Math.min(min, y)
    max = Math.max(max, y)
  }
  return max - min
}

const stems = Object.fromEntries(
  weights.map((w) => [w, verticalExtent(readPaths(w, 'remove'))])
)
const rendered = (weight, size) => (stems[weight] / GRID) * size

const report = []
for (const [tier, { size, ...targets }] of Object.entries(tiers)) {
  for (const state of ['rest', 'emphasis']) {
    const weight = calibration[tier][state]
    const px = rendered(weight, size)
    const target = targets[state]
    if (Math.abs(px - target) / target > TOLERANCE) {
      throw new Error(
        `${tier} ${state}: weight ${weight} renders ${px.toFixed(2)} px at ${size} px, target ${target} px`
      )
    }
    report.push(
      ` *   ${tier} ${size} px ${state}: ${weight} (${px.toFixed(2)} px; target ${target} px)`
    )
  }
}

const byWeight = weights.map((w) => [
  w,
  Object.entries(inventory).map(([name, file]) => [name, readPaths(w, file)]),
])

const ts = `// Generated by scripts/build-icons.js from @material-symbols/svg-{${weights.join(',')}}
// (Rounded, FILL 0 unless stated, opsz 48, GRAD 0; Apache License 2.0).
// Do not edit.

/** The §6.10 UI icon inventory, Material Symbols names. */
export const iconNames = [
${Object.keys(inventory)
  .map((n) => `  '${n}',`)
  .join('\n')}
] as const

export type IconName = (typeof iconNames)[number]

/** Material Symbols' 960-unit grid, shifted up by its height. */
export const iconViewBox = '${VIEWBOX}'

/** The weight instances generated. */
export const iconWeights = [${weights.join(', ')}] as const

export type IconWeight = (typeof iconWeights)[number]

/** The icon size tiers (§6.10): inline 16 px, tag 20 px, block 36 px. */
export type IconTier = 'inline' | 'tag' | 'block'

/**
 * Calibrated weights per tier [D166] (§1.5.12, §10.1). \`rest\` renders the
 * tier's target stroke; \`emphasis\` renders the next stroke tier at the same
 * size (the hover and press instance). Measured stems, 960-unit grid:
 * ${weights.map((w) => `${w} = ${+stems[w].toFixed(1)}`).join(', ')}.
${report.join('\n')}
 */
export const iconTierWeights: Record<
  IconTier,
  { readonly rest: IconWeight; readonly emphasis: IconWeight }
> = {
${Object.entries(calibration)
  .map(([t, w]) => `  ${t}: { rest: ${w.rest}, emphasis: ${w.emphasis} },`)
  .join('\n')}
}

/** Path data per weight and icon, to be filled in currentColor. */
export const iconPathsByWeight: Record<IconWeight, Record<IconName, string>> = {
${byWeight
  .map(
    ([w, entries]) =>
      `  ${w}: {\n${entries.map(([n, d]) => `    ${n}: '${d}',`).join('\n')}\n  },`
  )
  .join('\n')}
}

/**
 * Path data per icon at the inline tier's rest weight (${calibration.inline.rest}), for a
 * part that draws a 16 px glyph itself. Prefer \`<Icon>\`, which picks the
 * weight for its tier and state.
 */
export const iconPaths: Record<IconName, string> = iconPathsByWeight[${calibration.inline.rest}]
`
fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, ts)
