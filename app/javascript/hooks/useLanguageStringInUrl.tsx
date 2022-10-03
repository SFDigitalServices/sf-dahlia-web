import { useEffect, useState } from "react"
import { getCurrentLanguage } from "../util/languageUtil"

const useLanguageStringInUrl = () => {
  const [languageFromStringInUrl, setLanguageFromStringInUrl] = useState("en")
  const lang = getCurrentLanguage()

  useEffect(() => {
    setLanguageFromStringInUrl(lang)
  }, [lang])

  return languageFromStringInUrl
}

export default useLanguageStringInUrl
