import { useEffect } from "react"

const tWindow = window as any

const initGoogleTranslate = () => {
  // eslint-disable-next-line no-new
  new tWindow.google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,es,tl,zh-TW",
      layout: tWindow.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false,
      multilanguagePage: true,
    },
    "google_translate_element"
  )
}

export const useTranslate = () => {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "//translate.google.com/translate_a/element.js?cb=initGoogleTranslate"
    document.body.append(script)
    tWindow.initGoogleTranslate = initGoogleTranslate

    return () => {
      script.remove()
    }
  }, [])
}
