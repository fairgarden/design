// Static font imports (app/fontPreloads.ts): the bundler returns the file's URL.
declare module '*.woff2' {
  const asset: string | { src: string }
  export default asset
}
