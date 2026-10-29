// Only follow ?next= back into the app, never to another site.
export function safeNext(next) {
  return next && next.startsWith('/dashboard') && !next.startsWith('//') ? next : null
}
