'use client'

import React, { useContext, useMemo } from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva } from 'class-variance-authority'

import styles from './ground.module.css'
import {
  actionScaleVariants,
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import {
  GroundContext,
  presetDefaults,
  presets,
  resolveScheme,
  type BandPreset,
  type FieldPreset,
  type GroundKind,
  type GroundPreset,
  type PageGroundPreset,
  type ScopeValue,
} from '../../utils/scope'

export {
  companionField,
  companionFields,
  fieldPresets,
  pageGroundPresets,
  pastelPresets,
  presetDefaults,
  type BandPreset,
  type FieldPreset,
  type GroundKind,
  type GroundPreset,
  type PageGroundPreset,
  type PastelPreset,
  type PresetDefaults,
} from '../../utils/scope'

/*
 * Ground (§1.11.5) [D178]. CVA function `ground`.
 * - `kind` → band | field | face: geometry, and the container edge the
 *   scope publishes as --role-edge (--role-rule on a band, --primary12 on a
 *   field or a light island, --primary10 on a face on a page ground).
 * - `framed` → the one framed feature field per page (fields only).
 * - `island` is computed, never a prop: a page ground nested as a face
 *   inside a field or the night band [D149, D179].
 * - Color axes: computed from the preset or the overrides, never defaulted
 *   [D133].
 */
export const ground = cva(styles.base, {
  variants: {
    kind: {
      band: styles.band,
      field: styles.field,
      face: styles.face,
    },
    framed: {
      true: styles.framed,
    },
    island: {
      true: styles.island,
    },
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
    action: actionScaleVariants,
  },
  defaultVariants: {
    kind: 'band',
    framed: false,
    island: false,
  },
})

export type Density = 'compact' | 'default' | 'spacious'

interface GroundCommonProps {
  /**
   * Override the preset's primary. Inside tinted or solid scopes, only a
   * pairing that §2's matrix verifies [D128].
   */
  primary?: PrimaryScale
  /** Override the preset's secondary. */
  secondary?: RadixScale
  /** Override the scope's action scale. */
  action?: RadixScale
  /** Written as `data-density`; inherited by the scope, so never defaulted. */
  density?: Density
}

interface GroundBandProps {
  /**
   * `band` (default): a full-bleed section or the page root, drawing its
   * `--role-seam` rule top and bottom (visible only on the night band in
   * dark mode [D179]). `field`: an inset, fixed-mode surface with a radius
   * and a `--primary12` edge. `face`: a nested card face, plate or panel.
   */
  kind?: 'band'
  /**
   * A page ground (`paper` default, `white`, or one pastel per page:
   * `tide`, `meadow`, `pollen`, `apricot`, `rose`, `heather`), which follows
   * the page mode; or `night`, always dark, for the footer and the media hero
   * only [D176, D177].
   */
  preset?: BandPreset
  framed?: never
  onMedia?: never
}

interface GroundFieldProps {
  kind: 'field'
  /**
   * A field [D177]: `forest`, `royal`, `brick` (always dark) or `leaf`,
   * `amber`, `clay`, `pink` (always light). Required.
   */
  preset: FieldPreset
  /**
   * The one framed feature field per page: `--fgd-radius-feature` and a
   * `--border-size-2` `--primary12` edge [D95]. Default `false`.
   */
  framed?: boolean
  onMedia?: never
}

interface GroundFaceProps {
  kind: 'face'
  /**
   * A page ground as a card face, plate or panel (`paper` default). On a
   * page ground it follows the mode; inside a field or the night band it is
   * a light island [D149, D179].
   */
  preset?: PageGroundPreset
  framed?: never
  onMedia?: never
}

interface GroundMediaFaceProps {
  kind: 'face'
  /** `night` as a face: only the `onMedia` Button's dark face (§1.11.10). */
  preset: 'night'
  /** Declares the face as the `onMedia` Button's; required with `night` [D178]. */
  onMedia: true
  framed?: never
}

/**
 * Props for Ground: `section` props, `render`, the kind and its preset, the
 * scale overrides and the density. A discriminated union on `kind` [D178]:
 * a field preset outside `kind="field"`, `night` as a field, `night` as a
 * face other than `onMedia`, and deferred or retired presets are type
 * errors. Page grounds always follow the mode, so a pastel can never be a
 * fixed-mode anchor.
 */
export type GroundProps = useRender.ComponentProps<'section'> &
  GroundCommonProps &
  (GroundBandProps | GroundFieldProps | GroundFaceProps | GroundMediaFaceProps)

/**
 * The ground scope component (§1.11.5). Writes data-ground, data-tone and
 * data-scheme (and data-theme where the scope fixes its mode or is a light
 * island [D149]), adds the scale classes for the preset's defaults or the
 * overrides, paints `--role-ground`, publishes `--role-edge`, draws the
 * seam on bands and the edge on fields, and provides the scope to
 * descendants through React context [D148, D178].
 */
export const Ground = React.forwardRef<HTMLElement, GroundProps>(
  function Ground(props, forwardedRef) {
    const {
      preset: presetProp,
      kind: kindProp,
      framed,
      // A type-level declaration only; never reaches the DOM.
      onMedia: _onMedia,
      primary,
      secondary,
      action,
      density,
      render,
      className,
      children,
      ...rest
    } = props

    const preset: GroundPreset = presetProp ?? 'paper'
    const kind: GroundKind = kindProp ?? 'band'

    const parent = useContext(GroundContext)
    const { tone, mode } = presets[preset]
    const scheme = resolveScheme(preset, parent)
    // A follows-mode preset inside a fixed scope is a light island.
    const island = mode === 'follows' && scheme === 'light'

    const scope = useMemo<ScopeValue>(
      () => ({ ground: preset, tone, scheme, kind }),
      [preset, tone, scheme, kind]
    )

    const defaults = presetDefaults[preset]
    const resolvedPrimary = primary ?? defaults.primary
    const resolvedAction =
      action ?? (defaults.action === 'ink' ? resolvedPrimary : defaults.action)

    // Fixed presets write their mode; a follows-mode preset writes nothing
    // at page level and becomes a light island inside a fixed scope.
    const theme =
      mode === 'always-dark'
        ? 'dark'
        : mode === 'always-light' || island
          ? 'light'
          : undefined

    const element = useRender({
      defaultTagName: 'section',
      render,
      ref: forwardedRef,
      props: mergeProps<'section'>(
        {
          className: ground({
            kind,
            framed: kind === 'field' && framed === true,
            island,
            primary: resolvedPrimary,
            secondary: secondary ?? defaults.secondary,
            action: resolvedAction,
            className,
          }),
          'data-ground': preset,
          'data-tone': tone,
          'data-scheme': scheme,
          'data-theme': theme,
          'data-density': density,
          children,
        } as React.ComponentProps<'section'>,
        rest
      ),
    })

    return (
      <GroundContext.Provider value={scope}>{element}</GroundContext.Provider>
    )
  }
)
