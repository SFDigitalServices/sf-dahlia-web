// This is adapted from the filter implemented in customFilters.js.coffee
// for doing a barebones sanitization of incoming raw html. Our html/markdown
// parsing library (markdown-to-jsx) currently has reported issues
// with nested <span> tags so it's necessary to strip them to
// avoid buggy parsing behavior.

// https://github.com/probablyup/markdown-to-jsx/issues?q=is%3Aissue+is%3Aopen+span

// TODO: we should enforce input to be a string

export const stripMostTags = (input, allowed?: string) => {
  if (!input) return ""
  allowed = (((allowed || "<br><a><p>") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(
    ""
  )
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  const res = input.replace(tags, ($0, $1) => (allowed.includes(`<${$1.toLowerCase()}>`) ? $0 : ""))

  // replace any newlines with break tags
  return res.trim().replace(/\n/g, "<br>")
}
