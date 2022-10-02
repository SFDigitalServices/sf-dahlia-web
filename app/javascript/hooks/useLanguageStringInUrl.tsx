import { getRoutePrefix } from "../util/languageUtil"

const useLanguageStringInUrl = () => {
  return window.location?.pathname && getRoutePrefix(window.location.pathname)
}

export default useLanguageStringInUrl
