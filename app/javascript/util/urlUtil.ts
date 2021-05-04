export const getPathWithoutLeadingSlash = (path: string): string => path.replace(/^\/+/, "")

export const getPathWithoutTrailingSlash = (path: string): string => path.replace(/\/+$/, "")

const trimSlashes = (path: string): string =>
  getPathWithoutTrailingSlash(getPathWithoutLeadingSlash(path))

export const cleanPath = (path: string): string => `/${trimSlashes(path)}`
