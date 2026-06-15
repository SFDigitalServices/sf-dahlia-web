// Vendored from @bloom-housing/ui-components src/helpers/links.ts
export const isExternalLink = (href: string) => {
  return href.startsWith("http://") || href.startsWith("https://")
}

export const isInternalLink = (href: string) => {
  return href.startsWith("/") && !href.startsWith("//")
}
