/** A flat 3:2 placeholder (inline SVG), standing in for a photograph in these demos. */
export const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">' +
      '<rect width="300" height="200" fill="#b8c4a8"/>' +
      '<path d="M0 140 80 86l52 38 44-30 124 76v30H0z" fill="#5f6f4e"/>' +
      '</svg>'
  )

/** A square placeholder for the entry cards' images. */
export const square =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#c9b99a"/>' +
      '<circle cx="50" cy="56" r="26" fill="#7a6a4f"/>' +
      '</svg>'
  )
