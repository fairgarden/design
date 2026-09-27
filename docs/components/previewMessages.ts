/*
 * The messages between a page frame (FramedPreview, on a docs page) and the
 * preview route it holds (PreviewStage, under app/preview): the preview
 * posts its content height, and the frame asks for it again when it mounts
 * after the preview did. Same origin only.
 */

/** The message a preview posts to its frame with its content height. */
export const PREVIEW_HEIGHT = 'fairgarden-preview-height'

/** The frame's request for that message. */
export const PREVIEW_HEIGHT_REQUEST = 'fairgarden-preview-height-request'
