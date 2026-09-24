'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  useYAxisScale,
} from 'recharts'

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../../disclosure/collapsible'
import { Figure, FigureCaption, FigureMedia } from '../figure'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../table'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import {
  GROUND,
  HALO,
  INK_PRIMARY,
  PatternDefs,
  SEQUENTIAL_FILLS,
  safeId,
  slotFill,
  slotInk,
  stepPatternFill,
  type PatternClassNames,
  type SequentialStep,
  type SeriesSlot,
} from '../../utils/seriesPatterns'
import { useMediaQuery } from '../../utils/useMediaQuery'
import styles from './chart.module.css'

export type { SeriesSlot, SequentialStep }

/*
 * Chart (§8.7) [D167, D125]: a Recharts SVG chart in a figure, with a
 * custom legend, a caption and the "Show Data Table" Collapsible.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: chart.module.css; CVA function `chart`.
 * - Axes: `kind` → bar | column | line | area (the structural build);
 *   `oneInk` → `oneInk` (forces one ink: every slot in --primary12,
 *   sequential cells as their patterns on screen); `primary`, `secondary` →
 *   scales module classes. `secondary` carries the odd slots and the
 *   sequential steps, `primary` the even slots, slot 6, every edge, axis and
 *   label.
 * - Inks by ground, with no prop: odd slots take --role-series-odd and the
 *   sequential cells follow the --fgd-series-fill / --fgd-series-pattern
 *   switches, which roles.css resolves per scope: two inks and flat steps
 *   on a light base ground or a nested `white` plate, one ink and patterns
 *   everywhere else, the pastels included (§8.7) [D125].
 * - Compound variants: none.
 * - Defaults: kind bar, oneInk false; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: the Recharts surface's `:focus-visible` → the ring; the active
 *   category (hover or arrow keys, the accessibility layer) → the tooltip,
 *   the cursor, and a --border-size-2 edge on the active bars, markers one
 *   size up; nothing fades. The table trigger per §10.13.
 * - Parts: base, body (the FigureMedia), legend, legendItem, swatch,
 *   stepLegend, chartArea, axisTitle, plot, plotBars, plotColumns, print,
 *   tooltip, dataTable (the Collapsible holding the §8.2 Table). The
 *   caption is the Figure's FigureCaption (§8.5): label, caption, source.
 * - Scope: none. Container: `base`, named `chart` because it holds the
 *   Figure's own container. Baseline: horizontal bars,
 *   legend above; from 1024 px a column chart draws columns and the legend
 *   moves to the side (§5.10.2). Print: a fixed 174 mm chart.
 *
 * Every fill, stroke and label is a role-variable string passed to Recharts
 * (never a Radix variable or literal), fills are opaque (fillOpacity 1), and
 * nothing is a gradient, shadow or opacity animation [D16, D21, D91].
 */
export const chart = cva(styles.base, {
  variants: {
    // Only a column chart restructures by container width; the other builds
    // differ inside the SVG, so their classes carry no rules.
    kind: {
      bar: '',
      column: styles.column,
      line: '',
      area: '',
    },
    oneInk: {
      true: styles.oneInk,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'bar',
    oneInk: false,
  },
})

type ChartVariants = VariantProps<typeof chart>

/** The chart's structural build. */
export type ChartKind = NonNullable<ChartVariants['kind']>

/*
 * Token mirrors. SVG attributes and Recharts' layout take numbers, so these
 * values mirror their tokens (like TOOLTIP_DELAY_MS mirrors its token).
 */
/** Bar thickness, --size-px-3: at least --size-px-2-5 (12 px) at every size [I7]. */
const BAR_THICKNESS = 16
/** Gap between bars in one category: at least 0.3 × the thickness. */
const BAR_GAP = 6
/** Gap between categories, --size-px-3. */
const CATEGORY_GAP = 16
/** --border-size-1. */
const STROKE_1 = 1
/** --border-size-1-5. */
const STROKE_1_5 = 1.5
/** --border-size-2. */
const STROKE_2 = 2
/** Point marker radius: an 8 px marker. */
const MARKER_RADIUS = 4
/** A column never grows wider than --size-px-8. */
const MAX_COLUMN = 48
/** --fgd-duration-disclosure: growth by length only, under --motionOK. */
const DURATION = 200
/** --fgd-print-live-width, 174 mm at 96 px per inch. */
const PRINT_WIDTH = 658
/** Plot height of column, line and area charts. */
const DEFAULT_HEIGHT = 320
/** Space the value axis takes when it shows under horizontal bars. */
const AXIS_HEIGHT = 28
/** Advance of one `type-data` character: IBM Plex Mono is 0.6 em at 14 px. */
const DATA_CHAR = 8.4
/** Average advance of one `type-caption` character at 14 px. */
const TEXT_CHAR = 7.5
/** The thinnest area band that takes a direct label. */
const MIN_LABEL_BAND = 18
/** Open Props' --motionOK. */
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

/** Pattern part classes, for this module's print and forced-colors rules. */
const patternClassNames: PatternClassNames = {
  mark: styles.patternMark,
  dot: styles.patternDot,
  ground: styles.patternGround,
}

/** One series: a numeric field of the rows, drawn in one pattern slot. */
export interface ChartSeries<Key extends string = string> {
  /** The row field holding this series' values. */
  key: Key
  /** The series name: direct label, legend entry, tooltip and table column head. */
  name: string
  /**
   * The pattern slot (§8.7): 1 solid, 2 hatch 45°, 3 dot screen, 4 hatch
   * 0°, 5 crossed hatch, 6 outline ("Other", always the remainder).
   * Default: the series' position, so the first series is the emphasis
   * series. A series keeps its slot on screen, in print and in the legend.
   */
  slot?: SeriesSlot
}

/** A sequential encoding: each row's step, 1–5, drawn as a stepped fill (§8.7). */
export interface ChartSteps<Key extends string = string> {
  /** The row field holding the step, an integer from 1 to 5. */
  key: Key
  /** The step's name, for the tooltip and the data-table column head. */
  name: string
  /** End labels of the stepped legend, e.g. `['0/8', '8/8 planted']`. */
  labels?: readonly [React.ReactNode, React.ReactNode]
}

type FieldKey<Row> = Extract<keyof Row, string>

/** Props for Chart: `div` props plus the data, the encoding and the figure text. */
export type ChartProps<Row extends object = Record<string, unknown>> = Omit<
  React.ComponentPropsWithRef<'div'>,
  'children'
> & {
  /**
   * `bar` (default): horizontal bars, labels left, values at the bar ends,
   * the form preferred on mobile. `column`: horizontal bars below 1024 px of
   * the container and in print, columns from 1024 px. `line`: lines told
   * apart by point markers (● ○ ■ □ ▲), never by dashes. `area`: stacked
   * areas; several series always stack, because patterns never overlap.
   */
  kind?: ChartVariants['kind']
  /** The rows, one per category, in display order. */
  data: readonly Row[]
  /** The row field naming each category (bar label, column or time tick). */
  categoryKey: FieldKey<Row>
  /** Head of the category column in the data table. Default "Category". */
  categoryLabel?: string
  /**
   * The series, in the semantic order: at most 4 (6 at the hard limit;
   * beyond that, small multiples). Extra series are not drawn.
   */
  series: readonly ChartSeries<FieldKey<Row>>[]
  /** The figure caption, which is the chart's title: say what to notice. */
  caption: React.ReactNode
  /** The figure label, e.g. "Fig. 3", on its own line above the caption. */
  figureLabel?: React.ReactNode
  /** Source and method notes, e.g. "Source: Trail counters, 2026." */
  source?: React.ReactNode
  /** Value axis title with its units, e.g. "Visitors (thousands)". */
  valueLabel?: string
  /**
   * Formats every value: labels, ticks, tooltip and table. Default: grouped
   * digits (`toLocaleString('en-US')`).
   */
  formatValue?: (value: number) => string
  /** Stacks bar and column series into one bar per category. Area series always stack. */
  stacked?: boolean
  /**
   * Single highlight: this series takes slot 1 and every other series
   * slot 6 (outline), the preferred form for "one against the rest".
   */
  highlight?: FieldKey<Row>
  /**
   * A sequential encoding for a single-series bar or column chart: each bar
   * takes its row's step fill (secondary 4 / 6 / 8 / 11 / 12 on screen), and
   * its print pattern as a print-only layer.
   */
  steps?: ChartSteps<FieldKey<Row>>
  /**
   * Direct labels (`LabelList`): values at bar ends, series names and last
   * values at line ends, names inside areas. Default `true`.
   */
  labels?: boolean
  /**
   * The custom legend above the chart (beside it from 1024 px), with 16 px
   * swatches showing the fill drawn. Default: shown for grouped or stacked
   * bars with more than one series, where direct labels cannot name them.
   */
  legend?: boolean
  /**
   * Plot height in px on screen. Default: bars from their rows (16 px bars),
   * other charts 320.
   */
  height?: number
  /** Plot height in px in print. Default: the screen height. */
  printHeight?: number
  /**
   * Forces one ink: every slot in --primary12 and sequential cells as
   * patterns. Not needed for the ground: the scope already draws one ink
   * everywhere but a light base (`paper`, `white`) or a nested `white`
   * plate (§8.7). Default `false`.
   */
  oneInk?: ChartVariants['oneInk']
  /**
   * Primary Radix scale: even slots, slot 6, edges, axes and labels. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: ChartVariants['primary']
  /**
   * Secondary Radix scale: odd slots and sequential steps. Keep step 11 at
   * 3:1 on the ground (§2 pairing matrix) [D128]. Never defaulted.
   */
  secondary?: ChartVariants['secondary']
  /** The data-table trigger label. Default "Show Data Table". */
  tableLabel?: React.ReactNode
  /** The trigger label while the table is open. Default "Hide Data Table". */
  tableOpenLabel?: React.ReactNode
}

interface ResolvedSeries {
  key: string
  name: string
  slot: SeriesSlot
  ink: string
}

type DataRow = Record<string, unknown>

type PlotVariant = 'bars' | 'columns' | 'line' | 'area'

const defaultFormat = (value: number): string => value.toLocaleString('en-US')

function valueOf(row: DataRow | undefined, key: string): number | null {
  const value = row?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function stepOf(row: DataRow | undefined, key: string): SequentialStep {
  const value = Math.round(valueOf(row, key) ?? 1)
  return Math.min(5, Math.max(1, value)) as SequentialStep
}

function textOf(value: unknown): string {
  return value == null ? '' : String(value)
}

/* ------------------------------------------------------------------ */
/* SVG parts rendered inside Recharts                                  */
/* ------------------------------------------------------------------ */

/** A relation gridline: `line-dotted-fine` in --role-rule, drawn as true dots. */
function gridLine(props: {
  key?: React.Key | null
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}) {
  return (
    <line
      key={props.key ?? undefined}
      x1={props.x1}
      y1={props.y1}
      x2={props.x2}
      y2={props.y2}
      fill="none"
      stroke="var(--role-rule)"
      className={styles.gridLine}
    />
  )
}

type MarkerShape = 'circle' | 'square' | 'triangle'

/** Point markers by slot: ● ○ ■ □ ▲ △ (filled odd slots, open even slots). */
const markerShapes: Record<SeriesSlot, MarkerShape> = {
  1: 'circle',
  2: 'circle',
  3: 'square',
  4: 'square',
  5: 'triangle',
  6: 'triangle',
}

interface MarkerGlyphProps {
  cx?: number
  cy?: number
  slot: SeriesSlot
  ink: string
  active?: boolean
}

/** A line's point marker in its slot's shape; one size up and heavier when active. */
function MarkerGlyph({ cx, cy, slot, ink, active = false }: MarkerGlyphProps) {
  if (cx == null || cy == null || !Number.isFinite(cx) || !Number.isFinite(cy)) return null
  const r = active ? MARKER_RADIUS + 1 : MARKER_RADIUS
  const filled = slot % 2 === 1 && slot !== 6
  const fill = filled ? ink : GROUND
  const stroke = filled ? INK_PRIMARY : ink
  const strokeWidth = active ? STROKE_2 : filled ? STROKE_1 : STROKE_1_5
  const shape = markerShapes[slot]
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
  if (shape === 'square') {
    return (
      <rect
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    )
  }
  const h = r * 1.15
  return (
    <path
      d={`M${cx} ${cy - h}L${cx + h} ${cy + h * 0.8}L${cx - h} ${cy + h * 0.8}Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  )
}

interface StepShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: unknown
  prefix: string
  stepKey: string
}

/**
 * A sequential bar: its flat screen fill and, as a second layer, its print
 * pattern. The print block hides the fill and shows the pattern [D126, D167].
 */
function StepShape({ x = 0, y = 0, width = 0, height = 0, payload, prefix, stepKey }: StepShapeProps) {
  const step = stepOf(payload as DataRow | undefined, stepKey)
  const box = {
    x: width < 0 ? x + width : x,
    y: height < 0 ? y + height : y,
    width: Math.abs(width),
    height: Math.abs(height),
  }
  return (
    <g>
      <rect
        {...box}
        className={styles.stepFill}
        fill={SEQUENTIAL_FILLS[step]}
        fillOpacity={1}
        stroke={INK_PRIMARY}
        strokeWidth={STROKE_1}
      />
      <rect
        {...box}
        className={styles.stepPattern}
        fill={stepPatternFill(prefix, step)}
        fillOpacity={1}
        stroke={INK_PRIMARY}
        strokeWidth={STROKE_1}
      />
    </g>
  )
}

interface EndLabelProps {
  viewBox?: unknown
  index?: number
  value?: unknown
  last: number
  name: string
  format: (value: number) => string
}

/** A line's direct label at its end point: the series name and the last value. */
function EndLabel({ viewBox, index, value, last, name, format }: EndLabelProps) {
  const box = viewBox as { x?: number; y?: number } | undefined
  if (index !== last || box?.x == null || box.y == null) return null
  return (
    <text
      x={box.x + MARKER_RADIUS + 6}
      y={box.y}
      dy="0.35em"
      textAnchor="start"
      fill={INK_PRIMARY}
      className={styles.endLabel}
    >
      <tspan className={styles.endName}>{name}</tspan>
      {typeof value === 'number' ? (
        <tspan className={styles.endValue} dx="6">
          {format(value)}
        </tspan>
      ) : null}
    </text>
  )
}

interface AreaLabelProps {
  viewBox?: unknown
  index?: number
  last: number
  low: number
  high: number
  name: string
}

/** An area's direct label: its name inside its band at the last point, on a --role-halo knockout. */
function AreaLabel({ viewBox, index, last, low, high, name }: AreaLabelProps) {
  const yScale = useYAxisScale()
  const box = viewBox as { x?: number } | undefined
  if (index !== last || !yScale || box?.x == null) return null
  const top = yScale(high)
  const bottom = yScale(low)
  if (top == null || bottom == null || Math.abs(bottom - top) < MIN_LABEL_BAND) return null
  return (
    <text
      x={box.x - 8}
      y={(top + bottom) / 2}
      dy="0.35em"
      textAnchor="end"
      fill={INK_PRIMARY}
      stroke={HALO}
      className={styles.areaLabel}
    >
      {name}
    </text>
  )
}

interface SwatchProps {
  slot: SeriesSlot
  ink: string
  prefix: string
  oneInk: boolean
  line: boolean
}

/** A 16 px swatch showing the fill actually drawn, edged in --border-size-1 --primary12. */
function Swatch({ slot, ink, prefix, oneInk, line }: SwatchProps) {
  return (
    <svg className={styles.swatch} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {line ? (
        <>
          <line x1={0} y1={8} x2={16} y2={8} stroke={ink} strokeWidth={STROKE_2} />
          <MarkerGlyph cx={8} cy={8} slot={slot} ink={ink} />
        </>
      ) : (
        <rect
          x={0.5}
          y={0.5}
          width={15}
          height={15}
          fill={slotFill(prefix, slot, oneInk)}
          fillOpacity={1}
          stroke={INK_PRIMARY}
          strokeWidth={STROKE_1}
        />
      )}
    </svg>
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
  series: readonly ResolvedSeries[]
  categoryKey: string
  steps?: { key: string; name: string }
  prefix: string
  oneInk: boolean
  line: boolean
  format: (value: number) => string
}

/**
 * The tooltip panel: an anchored overlay with a --border-size-2 --primary12
 * edge, the Tooltip roles (--primary1 face, --primary12 text) and values in
 * `type-data`; no shadow. It repeats the row's values in series order, the
 * same values the table holds, and never adds one.
 */
function ChartTooltip({
  active,
  payload,
  series,
  categoryKey,
  steps,
  prefix,
  oneInk,
  line,
  format,
}: ChartTooltipProps) {
  const row = payload?.[0]?.payload as DataRow | undefined
  if (!active || !row) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{textOf(row[categoryKey])}</p>
      <ul className={styles.tooltipList}>
        {series.map((entry) => {
          const value = valueOf(row, entry.key)
          return (
            <li key={entry.key} className={styles.tooltipItem}>
              <Swatch slot={entry.slot} ink={entry.ink} prefix={prefix} oneInk={oneInk} line={line} />
              <span className={styles.tooltipName}>{entry.name}</span>
              <span className={styles.tooltipValue}>{value == null ? '—' : format(value)}</span>
            </li>
          )
        })}
        {steps ? (
          <li className={styles.tooltipItem}>
            <span aria-hidden="true" />
            <span className={styles.tooltipName}>{steps.name}</span>
            <span className={styles.tooltipValue}>{stepOf(row, steps.key)}/5</span>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* One Recharts chart                                                  */
/* ------------------------------------------------------------------ */

interface PlotProps {
  variant: PlotVariant
  prefix: string
  print: boolean
  width?: number
  height: number
  rows: DataRow[]
  categoryKey: string
  series: readonly ResolvedSeries[]
  stacked: boolean
  steps?: { key: string; name: string }
  labels: boolean
  oneInk: boolean
  animate: boolean
  format: (value: number) => string
  title?: string
}

function Plot(props: PlotProps) {
  const {
    variant,
    prefix,
    print,
    width,
    height,
    rows,
    categoryKey,
    series,
    stacked,
    steps,
    labels,
    oneInk,
    animate,
    format,
    title,
  } = props

  const last = rows.length - 1
  const labelFormatter = (value: unknown) => (typeof value === 'number' ? format(value) : textOf(value))
  const longestValue = Math.max(
    1,
    ...rows.flatMap((row) =>
      series.map((entry) => {
        const value = stacked
          ? series.reduce((sum, item) => sum + (valueOf(row, item.key) ?? 0), 0)
          : valueOf(row, entry.key)
        return value == null ? 0 : format(value).length
      })
    )
  )
  const longestName = Math.max(1, ...series.map((entry) => entry.name.length))

  const shared = {
    id: prefix,
    data: rows,
    accessibilityLayer: !print,
    title,
    width,
    height: width == null ? undefined : height,
    tabIndex: print ? -1 : undefined,
    style: print
      ? { width: '100%', height: 'auto', aspectRatio: `${width} / ${height}` }
      : undefined,
  }

  // Lines are told apart by markers, so they need no pattern slots.
  const defs = (
    <PatternDefs
      prefix={prefix}
      oneInk={oneInk}
      slots={variant === 'line' ? [] : series.map((entry) => entry.slot)}
      steps={steps != null}
      classNames={patternClassNames}
    />
  )

  const tooltip = (cursor: 'band' | 'line') =>
    print ? null : (
      <Tooltip
        content={
          <ChartTooltip
            series={series}
            categoryKey={categoryKey}
            steps={steps}
            prefix={prefix}
            oneInk={oneInk}
            line={variant === 'line'}
            format={format}
          />
        }
        cursor={
          cursor === 'band'
            ? { className: styles.cursorBand, fill: 'none', stroke: INK_PRIMARY, strokeWidth: STROKE_1 }
            : { className: styles.cursorLine, stroke: INK_PRIMARY }
        }
        isAnimationActive={animate}
        animationDuration={DURATION}
        animationEasing="ease-out"
      />
    )

  const animation = {
    isAnimationActive: animate,
    animationDuration: DURATION,
    animationEasing: 'ease-out' as const,
  }

  const categoryTick = { className: styles.categoryTick, fill: INK_PRIMARY }
  // Value ticks sit on their rules: the numeral just above its gridline.
  const valueTick = { className: styles.valueTick, fill: INK_PRIMARY, dy: -6 }

  if (variant === 'bars' || variant === 'columns') {
    const horizontal = variant === 'bars'
    const onFill = stacked
    const labelPosition = onFill ? 'center' : horizontal ? 'right' : 'top'
    const endSpace = labels && !onFill ? Math.ceil(longestValue * DATA_CHAR) + 12 : 12

    return (
      <BarChart
        {...shared}
        layout={horizontal ? 'vertical' : 'horizontal'}
        barGap={BAR_GAP}
        barCategoryGap={horizontal ? CATEGORY_GAP : '30%'}
        margin={
          horizontal
            ? { top: 4, right: endSpace, bottom: 4, left: 0 }
            : { top: labels && !onFill ? 24 : 12, right: 8, bottom: 0, left: 0 }
        }
      >
        {defs}
        <CartesianGrid
          horizontal={horizontal ? false : gridLine}
          vertical={horizontal && !labels ? gridLine : false}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              hide={labels}
              axisLine={false}
              tickLine={false}
              tick={{ ...valueTick, dy: 4 }}
              tickFormatter={format}
              height={AXIS_HEIGHT}
            />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width="auto"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              interval={0}
              tick={categoryTick}
            />
            <ReferenceLine
              x={0}
              stroke={INK_PRIMARY}
              strokeWidth={STROKE_1}
              className={styles.zeroLine}
              ifOverflow="discard"
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey={categoryKey}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={categoryTick}
            />
            <YAxis
              type="number"
              width="auto"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={valueTick}
              tickFormatter={format}
            />
            <ReferenceLine
              y={0}
              stroke={INK_PRIMARY}
              strokeWidth={STROKE_1}
              className={styles.zeroLine}
              ifOverflow="discard"
            />
          </>
        )}
        {tooltip('band')}
        {series.map((entry) => (
          <Bar
            key={entry.key}
            dataKey={entry.key}
            name={entry.name}
            fill={slotFill(prefix, entry.slot, oneInk)}
            fillOpacity={1}
            stroke={INK_PRIMARY}
            strokeWidth={STROKE_1}
            radius={0}
            stackId={stacked ? 'stack' : undefined}
            barSize={horizontal ? BAR_THICKNESS : undefined}
            maxBarSize={horizontal ? undefined : MAX_COLUMN}
            shape={steps ? <StepShape prefix={prefix} stepKey={steps.key} /> : undefined}
            activeBar={steps || print ? false : { strokeWidth: STROKE_2 }}
            {...animation}
          >
            {labels ? (
              <LabelList
                dataKey={entry.key}
                position={labelPosition}
                offset={8}
                formatter={labelFormatter}
                fill={INK_PRIMARY}
                stroke={onFill ? HALO : undefined}
                className={onFill ? styles.labelOnFill : styles.valueLabel}
              />
            ) : null}
          </Bar>
        ))}
      </BarChart>
    )
  }

  const categoryAxis = (
    <XAxis
      type="category"
      dataKey={categoryKey}
      axisLine={false}
      tickLine={false}
      tickMargin={8}
      tick={categoryTick}
    />
  )
  const valueAxis = (
    <YAxis
      type="number"
      width="auto"
      axisLine={false}
      tickLine={false}
      tickMargin={8}
      tick={valueTick}
      tickFormatter={format}
    />
  )
  const zeroLine = (
    <ReferenceLine
      y={0}
      stroke={INK_PRIMARY}
      strokeWidth={STROKE_1}
      className={styles.zeroLine}
      ifOverflow="discard"
    />
  )

  if (variant === 'line') {
    const endSpace = labels
      ? Math.ceil(longestName * TEXT_CHAR + longestValue * DATA_CHAR) + MARKER_RADIUS + 20
      : 12
    return (
      <LineChart {...shared} margin={{ top: 12, right: endSpace, bottom: 0, left: 0 }}>
        {defs}
        <CartesianGrid horizontal={gridLine} vertical={false} />
        {categoryAxis}
        {valueAxis}
        {zeroLine}
        {tooltip('line')}
        {series.map((entry) => (
          <Line
            key={entry.key}
            type="linear"
            dataKey={entry.key}
            name={entry.name}
            stroke={entry.ink}
            strokeWidth={STROKE_2}
            fill="none"
            dot={<MarkerGlyph slot={entry.slot} ink={entry.ink} />}
            activeDot={print ? false : <MarkerGlyph slot={entry.slot} ink={entry.ink} active />}
            {...animation}
          >
            {labels ? (
              <LabelList
                content={<EndLabel last={last} name={entry.name} format={format} />}
              />
            ) : null}
          </Line>
        ))}
      </LineChart>
    )
  }

  // Stacked areas: each band's low and high at the last point, for its label.
  const lastRow = rows[last]
  let running = 0
  const bands = series.map((entry) => {
    const low = running
    running += valueOf(lastRow, entry.key) ?? 0
    return { low, high: running }
  })

  return (
    <AreaChart {...shared} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
      {defs}
      <CartesianGrid horizontal={gridLine} vertical={false} />
      {categoryAxis}
      {valueAxis}
      {tooltip('line')}
      {series.map((entry, index) => (
        <Area
          key={entry.key}
          type="linear"
          dataKey={entry.key}
          name={entry.name}
          stackId="stack"
          fill={slotFill(prefix, entry.slot, oneInk)}
          fillOpacity={1}
          stroke={INK_PRIMARY}
          strokeWidth={STROKE_1}
          dot={false}
          activeDot={
            print ? false : { r: MARKER_RADIUS, fill: HALO, stroke: INK_PRIMARY, strokeWidth: STROKE_2 }
          }
          {...animation}
        >
          {labels ? (
            <LabelList
              content={
                <AreaLabel
                  last={last}
                  low={bands[index].low}
                  high={bands[index].high}
                  name={entry.name}
                />
              }
            />
          ) : null}
        </Area>
      ))}
      {zeroLine}
    </AreaChart>
  )
}

/* ------------------------------------------------------------------ */
/* Legend and data table                                               */
/* ------------------------------------------------------------------ */

interface LegendProps {
  series: readonly ResolvedSeries[]
  prefix: string
  oneInk: boolean
  line: boolean
  showSeries: boolean
  steps?: ChartSteps
}

/**
 * The custom legend (Recharts' own is never used): 16 px swatches showing
 * the fill drawn, in the chart's inks, and for a sequential encoding a
 * framed stepped bar with end labels. Its patterns are defined in its own
 * defs, so it never depends on a chart copy that is hidden.
 */
function Legend({ series, prefix, oneInk, line, showSeries, steps }: LegendProps) {
  return (
    <div className={styles.legend}>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <PatternDefs
          prefix={prefix}
          oneInk={oneInk}
          slots={series.map((entry) => entry.slot)}
          steps={steps != null}
          classNames={patternClassNames}
        />
      </svg>
      {showSeries ? (
        <ul className={styles.legendList}>
          {series.map((entry) => (
            <li key={entry.key} className={styles.legendItem}>
              <Swatch slot={entry.slot} ink={entry.ink} prefix={prefix} oneInk={oneInk} line={line} />
              <span className={styles.legendLabel}>{entry.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {steps ? (
        <div className={styles.stepLegend}>
          {steps.labels ? <span className={styles.stepLabel}>{steps.labels[0]}</span> : null}
          <svg className={styles.stepBar} viewBox="0 0 81 17" aria-hidden="true" focusable="false">
            {([1, 2, 3, 4, 5] as const).map((step) => {
              const cell = { x: (step - 1) * 16 + 0.5, y: 0.5, width: 16, height: 16 }
              return (
                <g key={step}>
                  <rect
                    {...cell}
                    className={styles.stepFill}
                    fill={SEQUENTIAL_FILLS[step]}
                    stroke={INK_PRIMARY}
                    strokeWidth={STROKE_1}
                  />
                  <rect
                    {...cell}
                    className={styles.stepPattern}
                    fill={stepPatternFill(prefix, step)}
                    stroke={INK_PRIMARY}
                    strokeWidth={STROKE_1}
                  />
                </g>
              )
            })}
          </svg>
          {steps.labels ? <span className={styles.stepLabel}>{steps.labels[1]}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

interface DataTableProps {
  caption: React.ReactNode
  valueLabel?: string
  categoryLabel: string
  rows: DataRow[]
  categoryKey: string
  series: readonly ResolvedSeries[]
  steps?: ChartSteps
  format: (value: number) => string
}

/**
 * The data-table alternative, a §8.2 Table with the chart's series names
 * and units: right-aligned tabular numerals, "—" for an empty cell, the
 * five-row cadence past 10 rows. Up to four columns it fits at every width;
 * wider, it scrolls with the category column pinned.
 */
function DataTable({
  caption,
  valueLabel,
  categoryLabel,
  rows,
  categoryKey,
  series,
  steps,
  format,
}: DataTableProps) {
  const columns = 1 + series.length + (steps ? 1 : 0)
  return (
    <Table strategy={columns <= 4 ? 'fit' : 'scroll'}>
      <TableCaption note={valueLabel}>{caption}</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{categoryLabel}</TableHeaderCell>
          {series.map((entry) => (
            <TableHeaderCell key={entry.key} numeric>
              {entry.name}
            </TableHeaderCell>
          ))}
          {steps ? <TableHeaderCell numeric>{steps.name}</TableHeaderCell> : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${textOf(row[categoryKey])}-${index}`}>
            <TableHeaderCell>{textOf(row[categoryKey])}</TableHeaderCell>
            {series.map((entry) => {
              const value = valueOf(row, entry.key)
              return (
                <TableCell key={entry.key} numeric>
                  {value == null ? '—' : format(value)}
                </TableCell>
              )
            })}
            {steps ? (
              <TableCell numeric>
                {valueOf(row, steps.key) == null ? '—' : `${stepOf(row, steps.key)}/5`}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ------------------------------------------------------------------ */
/* Chart                                                               */
/* ------------------------------------------------------------------ */

/**
 * A chart figure (§8.7) built with Recharts [D167]. Categories are told
 * apart by the `pattern-series` slots, on screen as in print: odd slots in
 * --secondary11, even in --primary12, slot 1 solid, slot 6 outline, every
 * shape edged in --border-size-1 --primary12 [D125]. Values are labelled
 * directly; the tooltip and the keyboard accessibility layer repeat them;
 * the "Show Data Table" Collapsible holds them all. The chart follows its
 * container's width on screen and prints at a fixed 174 mm, animation off.
 */
export function Chart<Row extends object = Record<string, unknown>>(props: ChartProps<Row>) {
  const {
    kind,
    data,
    categoryKey,
    categoryLabel = 'Category',
    series,
    caption,
    figureLabel,
    source,
    valueLabel,
    formatValue,
    stacked = false,
    highlight,
    steps,
    labels = true,
    legend,
    height,
    printHeight,
    oneInk,
    primary,
    secondary,
    tableLabel = 'Show Data Table',
    tableOpenLabel = 'Hide Data Table',
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const motionOK = useMediaQuery(MOTION_QUERY)
  const id = safeId(React.useId(), 'chart')
  const resolvedKind: ChartKind = kind ?? 'bar'
  const ink = oneInk === true
  const format = formatValue ?? defaultFormat
  const rows = data as unknown as DataRow[]
  const isBar = resolvedKind === 'bar' || resolvedKind === 'column'
  const stepEncoding = isBar && steps ? { key: steps.key, name: steps.name } : undefined
  const stack = resolvedKind === 'area' || (isBar && stacked && !stepEncoding)

  const resolved = React.useMemo<ResolvedSeries[]>(
    () =>
      series.slice(0, stepEncoding ? 1 : 6).map((entry, index) => {
        const slot: SeriesSlot = highlight
          ? entry.key === highlight
            ? 1
            : 6
          : (entry.slot ?? (Math.min(index + 1, 6) as SeriesSlot))
        return { key: entry.key, name: entry.name, slot, ink: slotInk(slot, ink) }
      }),
    [series, highlight, ink, stepEncoding]
  )

  const showSeriesLegend = legend ?? (isBar && resolved.length > 1)
  const showLegend = showSeriesLegend || stepEncoding != null
  // Values that live only in the tooltip (every line point but the last,
  // area values, unlabelled charts) print as the data table beside the chart.
  const printTable = !labels || resolvedKind === 'line' || resolvedKind === 'area'

  const groupSize = stack || stepEncoding ? 1 : Math.max(1, resolved.length)
  const barsHeight =
    rows.length * (groupSize * BAR_THICKNESS + (groupSize - 1) * BAR_GAP + CATEGORY_GAP) +
    8 +
    (labels ? 0 : AXIS_HEIGHT)
  const screenHeight = height ?? (resolvedKind === 'bar' ? barsHeight : DEFAULT_HEIGHT)
  const columnsHeight = height ?? DEFAULT_HEIGHT

  const plotProps = {
    rows,
    categoryKey,
    series: resolved,
    stacked: stack,
    steps: stepEncoding,
    labels,
    oneInk: ink,
    format,
    title: typeof caption === 'string' ? caption : undefined,
  }

  const screenVariant: PlotVariant = isBar ? 'bars' : resolvedKind
  // Print resolves against the printed column (174 mm, under 1024 px), so a
  // column chart prints as horizontal bars.
  const printVariant: PlotVariant = screenVariant
  const printPlotHeight =
    printHeight ?? (isBar ? (resolvedKind === 'bar' ? screenHeight : barsHeight) : screenHeight)

  return (
    <div
      {...rest}
      {...scope}
      className={chart({
        kind,
        oneInk,
        primary,
        secondary,
        className: cx(printTable && styles.printTable, className) || undefined,
      })}
    >
      <Figure kind="technical">
        <FigureMedia className={cx(styles.body, showLegend && styles.withLegend)}>
          {showLegend ? (
            <Legend
              series={resolved}
              prefix={`${id}-legend`}
              oneInk={ink}
              line={resolvedKind === 'line'}
              showSeries={showSeriesLegend}
              steps={stepEncoding ? steps : undefined}
            />
          ) : null}
          <div className={styles.chartArea}>
            {valueLabel ? <p className={styles.axisTitle}>{valueLabel}</p> : null}
            <div className={styles.plot}>
              <div className={styles.plotBars}>
                <ResponsiveContainer width="100%" height={isBar ? barsHeight : screenHeight}>
                  <Plot
                    {...plotProps}
                    variant={screenVariant}
                    prefix={`${id}-screen`}
                    print={false}
                    height={isBar ? barsHeight : screenHeight}
                    animate={motionOK}
                  />
                </ResponsiveContainer>
              </div>
              {resolvedKind === 'column' ? (
                <div className={styles.plotColumns}>
                  <ResponsiveContainer width="100%" height={columnsHeight}>
                    <Plot
                      {...plotProps}
                      variant="columns"
                      prefix={`${id}-columns`}
                      print={false}
                      height={columnsHeight}
                      animate={motionOK}
                    />
                  </ResponsiveContainer>
                </div>
              ) : null}
            </div>
            <div className={styles.print} aria-hidden="true" inert>
              <Plot
                {...plotProps}
                variant={printVariant}
                prefix={`${id}-print`}
                print
                width={PRINT_WIDTH}
                height={printPlotHeight}
                animate={false}
              />
            </div>
          </div>
        </FigureMedia>
        <FigureCaption label={figureLabel} credit={source}>
          {caption}
        </FigureCaption>
      </Figure>
      <Collapsible className={styles.dataTable}>
        <CollapsibleTrigger openLabel={tableOpenLabel}>{tableLabel}</CollapsibleTrigger>
        <CollapsiblePanel>
          <DataTable
            caption={caption}
            valueLabel={valueLabel}
            categoryLabel={categoryLabel}
            rows={rows}
            categoryKey={categoryKey}
            series={resolved}
            steps={stepEncoding ? steps : undefined}
            format={format}
          />
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}
