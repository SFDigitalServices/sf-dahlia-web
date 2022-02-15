import { UrlObject } from "url"

import { GenericRouter, GenericRouterOptions } from "@bloom-housing/ui-components"

import { getNewLanguagePath } from "../util/routeUtil"

type UrlType = UrlObject | string

const Router: GenericRouter = {
  push: (url: UrlType, _as?: UrlType, options?: GenericRouterOptions) => {
    // TODO: after replacing this with react router, make sure to use the "as" parameter
    // to actually change the url display (currently the param is ignored).
    let urlString = typeof url !== "string" ? url.href : url

    if (options?.locale) {
      const asUrlObject: URL = new URL(urlString, window.location.origin)
      urlString = getNewLanguagePath(
        asUrlObject.pathname || "",
        options.locale,
        asUrlObject.search || ""
      )
    }

    window.location.href = urlString
  },
  // FIXME: remove when bloom makes this optional
  back: null,
  get pathname(): string {
    return window.location.pathname
  },
  get asPath(): string {
    return window.location.pathname + window.location.search
  },
}

export default Router
