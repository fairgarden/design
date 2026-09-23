import { StickerDetail } from '@fairgarden/design/foundations/sticker'

/*
 * A stand-in sticker asset for the demos, drawn at the S size (152 px): a
 * seedling, with its pre-expanded halo path. Real assets come from the
 * drawing library (§6.15).
 */
export const seedlingViewBox = '0 0 152 152'

export const seedlingHalo = (
  <path d="M36 128c-8 0-8-16 0-16h4c-4-12-10-32-10-54 0-12 14-14 28-8 4-12 22-20 42-18h12c8 0 6 12 4 20-6 20-18 28-28 32v28h28c8 0 8 16 0 16z" />
)

export function SeedlingArt() {
  return (
    <>
      <path d="M76 120V64" />
      <path d="M76 84c-16 0-32-10-36-28 18-2 32 8 36 28z" />
      <path d="M76 72c14-2 28-14 32-30-18 0-30 12-32 30z" />
      <path d="M44 120h64" />
      <StickerDetail>
        <path d="M74 82 50 60M78 70l24-22" />
      </StickerDetail>
      <circle cx="76" cy="120" r="3" fill="currentColor" stroke="none" />
    </>
  )
}
