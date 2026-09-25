'use client'

import * as React from 'react'
import type { UseCopierOpts } from '@fairgarden/docs/useCopier'

import { useToastManager, type ToastOptions } from '../../feedback/toast'

/*
 * Internal to Code Block and Demo: copy feedback as toasts (§10.17), never
 * as text in the header or a changed glyph in the actions. Copy source and
 * "Copy all files as Markdown" report through useCode's `copy` option: the
 * engine's copier calls `onCopied` or `onError` once the clipboard write
 * settles. Copy link reports through its own useCopier. A success toast
 * ("VolunteerShift.tsx copied", "Link copied", "Markdown copied")
 * auto-dismisses; a failure is a danger toast, which persists until
 * dismissed. Every copy toast shares one id, so a new copy replaces the one
 * showing instead of queueing behind it.
 *
 * The toasts go to the design system's ToastProvider above the block. With
 * none, copying stays silent: no toast and no error. Not exported from the
 * index.
 */

type CopyKind = 'source' | 'markdown' | 'link'

type CopyRequest = { kind: CopyKind; name?: string }

type CopyFunction = (event: React.MouseEvent<Element>) => Promise<void>

type AddToast = (options: ToastOptions) => void

/** One id for every copy toast on the page: a new copy replaces the one showing. */
const COPY_TOAST_ID = 'fgd-code-block-copy'

function copyToast({ kind, name }: CopyRequest, ok: boolean): ToastOptions {
  if (ok) {
    const title =
      kind === 'link' ? 'Link copied' : kind === 'markdown' ? 'Markdown copied' : `${name ?? 'Code'} copied`
    return { id: COPY_TOAST_ID, status: 'success', title }
  }
  const what = kind === 'link' ? 'the link' : kind === 'markdown' ? 'the Markdown' : (name ?? 'the code')
  return {
    id: COPY_TOAST_ID,
    status: 'danger',
    title: `Couldn't copy ${what}`,
    description: "The browser didn't allow access to the clipboard.",
  }
}

export type CopyToasts = {
  /** useCode's `copy` option: the source and Markdown copies' outcomes. */
  copyOpts: UseCopierOpts
  /** The link's useCopier options. */
  linkOpts: UseCopierOpts
  /** Wraps useCode's `copy` or `copyMarkdown`, so its toast says what was copied. */
  track: (kind: 'source' | 'markdown', copy: CopyFunction, name?: string) => CopyFunction
  /** The provider's `add`, set by CopyToaster; `null` without a provider. */
  toastRef: React.RefObject<AddToast | null>
}

/** The copy toasts for one block: pass `copyOpts` to useCode and the rest to CodeBlockSection. */
export function useCopyToasts(): CopyToasts {
  const toastRef = React.useRef<AddToast | null>(null)
  // useCode's copier reports the source and Markdown copies through the same
  // callbacks, in the order they were made, so each click queues what it copies.
  const queue = React.useRef<CopyRequest[]>([])

  return React.useMemo<CopyToasts>(() => {
    const show = (request: CopyRequest | undefined, ok: boolean) => {
      if (request) toastRef.current?.(copyToast(request, ok))
    }
    return {
      toastRef,
      copyOpts: {
        onCopied: () => show(queue.current.shift(), true),
        onError: () => show(queue.current.shift(), false),
      },
      linkOpts: {
        onCopied: () => show({ kind: 'link' }, true),
        onError: () => show({ kind: 'link' }, false),
      },
      track: (kind, copy, name) => (event) => {
        queue.current.push({ kind, name })
        return copy(event)
      },
    }
  }, [])
}

/**
 * The provider's toast manager, or `null` outside a ToastProvider. Base
 * UI's manager hook throws outside its provider before it calls any other
 * hook, so catching that keeps the hook order stable: a block never moves
 * in or out of a provider without remounting.
 */
function useOptionalToastManager() {
  try {
    return useToastManager()
  } catch {
    return null
  }
}

/**
 * Hands the page's toast manager to a block's copy toasts. A leaf of its
 * own, so a toast coming or going re-renders only this, never the block.
 */
export function CopyToaster(props: { toasts: CopyToasts }) {
  const { toasts } = props
  const manager = useOptionalToastManager()
  const add = manager ? manager.add : null

  React.useEffect(() => {
    toasts.toastRef.current = add
    return () => {
      toasts.toastRef.current = null
    }
  }, [add, toasts])

  return null
}
