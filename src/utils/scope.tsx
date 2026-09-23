'use client'

import { createContext, useContext } from 'react'

import type { PrimaryScale, RadixScale } from './scales'

/*
 * The v1 ground presets (§1.4.2) [D176, D177, D180]: eight page grounds, the
 * `night` band and seven fields, 16 in all. Deferred (sand, spruce, soil)
 * and retired (lichen) presets are not accepted.
 */

/** The six step-3 pastel page grounds [D176]. */
export const pastelPresets = ['tide', 'meadow', 'pollen', 'apricot', 'rose', 'heather'] as const

export type PastelPreset = (typeof pastelPresets)[number]

/**
 * The eight page grounds [D176]: follows-mode bands (or faces), painting the
 * same step in both modes. A page has at most one pastel, as its page
 * ground, with `paper` and `white` as its secondary bands [D179].
 */
export const pageGroundPresets = ['paper', 'white', ...pastelPresets] as const

export type PageGroundPreset = (typeof pageGroundPresets)[number]

/**
 * The seven fields [D177]: inset, fixed-mode surfaces with a radius and a
 * `--primary12` edge, never full-bleed. `kind="field"` only.
 */
export const fieldPresets = ['forest', 'leaf', 'amber', 'clay', 'pink', 'royal', 'brick'] as const

export type FieldPreset = (typeof fieldPresets)[number]

/** The presets a full-bleed band takes: the page grounds, and `night` for the footer and the media hero [D177]. */
export type BandPreset = PageGroundPreset | 'night'

/** Every v1 preset (§1.4.2) [D180]. */
export type GroundPreset = PageGroundPreset | 'night' | FieldPreset

/**
 * Ground's structural axis [D178]: a full-bleed `band` (a page ground, or
 * the `night` band), an inset `field`, or a nested `face` (card face, plate,
 * panel).
 */
export type GroundKind = 'band' | 'field' | 'face'

/**
 * Tone, as `roles.css` keys it (§1.4.2, §1.4.3) [D116]: `light-base` (paper,
 * white), `tinted` (the six pastels, one "pastel" ladder in both modes
 * [D176]), `dark-base` (night), `dark-tinted` (forest), `solid-light` (leaf,
 * amber, clay, pink) and `solid-dark` (royal, brick).
 */
export type Tone = 'light-base' | 'tinted' | 'dark-base' | 'dark-tinted' | 'solid-light' | 'solid-dark'

/**
 * `page`: a follows-mode scope; `light` / `dark`: a fixed-mode scope
 * (always-light field, light island, always-dark field or band) [D148].
 */
export type Scheme = 'page' | 'light' | 'dark'

export type ModeClass = 'follows' | 'always-light' | 'always-dark'

/** A preset's family (§1.4.2): which `kind` values accept it. */
export type PresetFamily = 'page' | 'night' | 'field'

export interface PresetDefinition {
  family: PresetFamily
  tone: Tone
  mode: ModeClass
}

/** §1.4.2 preset table: family, tone and mode class per preset. */
export const presets: Record<GroundPreset, PresetDefinition> = {
  paper: { family: 'page', tone: 'light-base', mode: 'follows' },
  white: { family: 'page', tone: 'light-base', mode: 'follows' },
  tide: { family: 'page', tone: 'tinted', mode: 'follows' },
  meadow: { family: 'page', tone: 'tinted', mode: 'follows' },
  pollen: { family: 'page', tone: 'tinted', mode: 'follows' },
  apricot: { family: 'page', tone: 'tinted', mode: 'follows' },
  rose: { family: 'page', tone: 'tinted', mode: 'follows' },
  heather: { family: 'page', tone: 'tinted', mode: 'follows' },
  night: { family: 'night', tone: 'dark-base', mode: 'always-dark' },
  forest: { family: 'field', tone: 'dark-tinted', mode: 'always-dark' },
  leaf: { family: 'field', tone: 'solid-light', mode: 'always-light' },
  amber: { family: 'field', tone: 'solid-light', mode: 'always-light' },
  clay: { family: 'field', tone: 'solid-light', mode: 'always-light' },
  pink: { family: 'field', tone: 'solid-light', mode: 'always-light' },
  royal: { family: 'field', tone: 'solid-dark', mode: 'always-dark' },
  brick: { family: 'field', tone: 'solid-dark', mode: 'always-dark' },
}

export interface PresetDefaults {
  primary: PrimaryScale
  secondary: RadixScale
  /** `ink`: the scope publishes its primary as the action scale (the ink pill). */
  action: RadixScale | 'ink'
}

/** §1.4.2: defaults primary × secondary; action. Amber is the action on every page ground [D176]. */
export const presetDefaults: Record<GroundPreset, PresetDefaults> = {
  paper: { primary: 'olive', secondary: 'green', action: 'amber' },
  white: { primary: 'olive', secondary: 'green', action: 'amber' },
  tide: { primary: 'slate', secondary: 'blue', action: 'amber' },
  meadow: { primary: 'sage', secondary: 'green', action: 'amber' },
  pollen: { primary: 'sand', secondary: 'yellow', action: 'amber' },
  apricot: { primary: 'sand', secondary: 'orange', action: 'amber' },
  rose: { primary: 'mauve', secondary: 'red', action: 'amber' },
  heather: { primary: 'mauve', secondary: 'purple', action: 'amber' },
  night: { primary: 'slate', secondary: 'green', action: 'amber' },
  forest: { primary: 'sage', secondary: 'amber', action: 'amber' },
  leaf: { primary: 'olive', secondary: 'green', action: 'ink' },
  amber: { primary: 'olive', secondary: 'amber', action: 'ink' },
  clay: { primary: 'olive', secondary: 'orange', action: 'ink' },
  pink: { primary: 'olive', secondary: 'pink', action: 'ink' },
  royal: { primary: 'slate', secondary: 'indigo', action: 'amber' },
  brick: { primary: 'mauve', secondary: 'red', action: 'amber' },
}

/**
 * Each page ground's companion field [D177], which replaces the inverse
 * pairs: the dark field for "inverse" placements and the Dialog's solid
 * cover.
 */
export const companionFields: Record<PageGroundPreset, FieldPreset> = {
  paper: 'forest',
  white: 'forest',
  meadow: 'forest',
  pollen: 'forest',
  tide: 'royal',
  heather: 'royal',
  apricot: 'brick',
  rose: 'brick',
}

/** The companion field of a page ground [D177], e.g. `companionField('tide')` is `royal`. */
export function companionField(preset: PageGroundPreset): FieldPreset {
  return companionFields[preset]
}

export function isPageGroundPreset(preset: GroundPreset): preset is PageGroundPreset {
  return presets[preset].family === 'page'
}

/** A full-bleed band preset: a page ground or `night` (not a field). */
export function isBandPreset(preset: GroundPreset): preset is BandPreset {
  return preset === 'night' || isPageGroundPreset(preset)
}

export function isPastelPreset(preset: GroundPreset): preset is PastelPreset {
  return presets[preset].tone === 'tinted'
}

export function isFieldPreset(preset: GroundPreset): preset is FieldPreset {
  return presets[preset].family === 'field'
}

export interface ScopeValue {
  ground: GroundPreset
  tone: Tone
  scheme: Scheme
  /** The scope's `kind` [D178]. */
  kind: GroundKind
}

export interface ScopeAttributes {
  'data-ground': GroundPreset
  'data-tone': Tone
  'data-scheme': Scheme
}

/** The page root is a `paper` band that follows the page mode (§1.4.3). */
export const rootScope = {
  ground: 'paper',
  tone: 'light-base',
  scheme: 'page',
  kind: 'band',
} as const satisfies ScopeValue

/**
 * Portaled overlay faces (menu, popover, dialog, toast) are a `white` scope
 * that follows the page mode, whatever the trigger's ground [D139].
 */
export const overlayScope = {
  ground: 'white',
  tone: 'light-base',
  scheme: 'page',
  kind: 'face',
} as const satisfies ScopeValue

/**
 * The nearest ground scope, provided by Ground. React context also reaches
 * portaled overlays, which is why every root writes the attributes itself.
 */
export const GroundContext = createContext<ScopeValue>(rootScope)
GroundContext.displayName = 'GroundContext'

export function toScopeAttributes(scope: ScopeValue): ScopeAttributes {
  return {
    'data-ground': scope.ground,
    'data-tone': scope.tone,
    'data-scheme': scope.scheme,
  }
}

/** The scope a component root belongs to; the `paper` band without a Ground. */
export function useScope(): ScopeValue {
  return useContext(GroundContext)
}

/**
 * Spread onto every component root so `roles.css` re-resolves the `--role-*`
 * aliases with that root's own `--primary*` / `--secondary*` [D148].
 */
export function useScopeAttributes(): ScopeAttributes {
  return toScopeAttributes(useContext(GroundContext))
}

/**
 * The scheme a nested scope of `preset` takes inside `parent`: fixed presets
 * (the night band and the fields) keep their mode; a page ground inside a
 * fixed scope is a light island [D149, D179]; otherwise it follows the page.
 */
export function resolveScheme(preset: GroundPreset, parent: ScopeValue): Scheme {
  const { mode } = presets[preset]
  if (mode === 'always-dark') return 'dark'
  if (mode === 'always-light') return 'light'
  return parent.scheme === 'page' ? 'page' : 'light'
}
