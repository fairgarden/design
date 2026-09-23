'use client'

import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react'
import { DirectionProvider } from '@base-ui/react/direction-provider'

export type Direction = 'ltr' | 'rtl'

export interface LocaleValue {
  locale: string
  direction: Direction
}

// Languages written right to left, for runtimes without Intl.Locale text info.
const RTL_LANGUAGES = new Set([
  'ar',
  'arc',
  'ckb',
  'dv',
  'fa',
  'he',
  'iw',
  'ks',
  'ku',
  'ps',
  'sd',
  'ug',
  'ur',
  'yi',
])
const RTL_SCRIPTS = new Set(['Arab', 'Hebr', 'Syrc', 'Thaa', 'Nkoo', 'Adlm'])

type LocaleWithTextInfo = Intl.Locale & {
  getTextInfo?: () => { direction?: string }
  textInfo?: { direction?: string }
}

/** The writing direction of a BCP 47 locale. */
export function getDirection(locale: string): Direction {
  try {
    const intlLocale = new Intl.Locale(locale) as LocaleWithTextInfo
    const info = intlLocale.getTextInfo?.() ?? intlLocale.textInfo
    if (info?.direction) return info.direction === 'rtl' ? 'rtl' : 'ltr'
    const script = intlLocale.maximize().script
    if (script) return RTL_SCRIPTS.has(script) ? 'rtl' : 'ltr'
    return RTL_LANGUAGES.has(intlLocale.language) ? 'rtl' : 'ltr'
  } catch {
    const language = locale.split(/[-_]/)[0]?.toLowerCase() ?? ''
    return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
  }
}

const defaultLocale: LocaleValue = { locale: 'en-US', direction: 'ltr' }
const LocaleContext = createContext<LocaleValue>(defaultLocale)
LocaleContext.displayName = 'LocaleContext'

/** The current locale and its writing direction. */
export function useLocale(): LocaleValue {
  return useContext(LocaleContext)
}

/**
 * Provides the locale (and its direction) to the design system and Base UI.
 * Place it once in the app shell, inside `<html lang={locale}>`.
 */
export const ClientProvider: FunctionComponent<
  PropsWithChildren<{ locale: string }>
> = ({ children, locale }) => {
  const value = useMemo<LocaleValue>(
    () => ({ locale, direction: getDirection(locale) }),
    [locale]
  )
  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider direction={value.direction}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  )
}
