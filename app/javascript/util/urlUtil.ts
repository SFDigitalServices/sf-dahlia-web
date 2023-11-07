export const getPathWithoutLeadingSlash = (path: string): string => path.replace(/^\/+/, "")

export const getPathWithoutTrailingSlash = (path: string): string => path.replace(/\/+$/, "")

const trimSlashes = (path: string): string =>
  getPathWithoutTrailingSlash(getPathWithoutLeadingSlash(path))

export const cleanPath = (path: string): string => `/${trimSlashes(path)}`

export const isValidUrl = (urlString: string): boolean => {
  try {
    return Boolean(new URL(urlString))
  } catch {
    return false
  }
}
