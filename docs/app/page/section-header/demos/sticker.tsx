/** A small line drawing with its halo, standing in for a §6.14 sticker in these demos. */
export function Sticker() {
  return (
    <svg viewBox="0 0 152 152" role="img" aria-label="A leaf">
      <path
        d="M76 136C40 120 24 86 36 52 60 58 88 44 108 20c20 40 12 92-32 116Z"
        fill="var(--role-halo)"
        stroke="var(--role-halo)"
        strokeWidth="16"
        strokeLinejoin="round"
      />
      <path
        d="M76 136C40 120 24 86 36 52 60 58 88 44 108 20c20 40 12 92-32 116ZM76 136c0-40 10-72 32-116"
        fill="none"
        stroke="var(--primary12)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
