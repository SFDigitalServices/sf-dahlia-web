// This is adapted from the filter implemented in customFilters.js.coffee
// for doing a barebones sanitization of incoming raw html. We should probably
// find a better solution with community support at some point

export const stripMostTags = (input, allowed?: string) => {
  if (!input) return ""
  allowed = (((allowed || "<br><a>") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("")
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  const res = input.replace(tags, ($0, $1) => (allowed.includes(`<${$1.toLowerCase()}>`) ? $0 : ""))

  // replace any newlines with break tags
  return res.trim().replace(/\n/g, "<br>")
}
