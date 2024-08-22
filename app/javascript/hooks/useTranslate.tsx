/*
 * This hook is for using an older version of Google Translate
 * that requires work to ensure the timing of script loading and event
 * dispatching is correct. Essentially, we inject a Google Translate script that adds
 * a <select> element to the dom. That <select> element is a dropdown of different languages
 * that we can machine translate the page with. We hide that <select> with css.
 * Once that <select> element is rendered (even though hidden), we use the language
 * set in the url to dispatch an event setting that <select>'s <option>
 * to the corresponding language. This gives an experience to the end user that
 * the page automatically got translated.
 * Soon to be deprecated
 */

import { useEffect } from "react"
import usePollElementRender from "./usePollElementRender"
import { getCurrentLanguage } from "../util/languageUtil"
import useScript from "./useScript"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tWindow = window as any
const languageMap = {
  zh: "zh-TW",
}

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

tWindow.initGoogleTranslate = initGoogleTranslate

const useTranslate = (disable) => {
  const languageInRoute = getCurrentLanguage()
  useScript("//translate.google.com/translate_a/element.js?cb=initGoogleTranslate", disable)
  /*
   * It seems the <select> and the <options> get added at different times.
   * We want to target the <select> for dispatching the change event, but we have to wait
   * until the <options> appear to dispatch the event.
   */
  const googleTranslateDropdownElHasBeenRendered = usePollElementRender(
    "select.goog-te-combo option",
    disable
  )

  useEffect(() => {
    if (!disable && languageInRoute && googleTranslateDropdownElHasBeenRendered) {
      // TODO(DAH-1581): Remove any type on line 55
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectInDom: any = document.querySelector("select.goog-te-combo")
      selectInDom.value = languageMap[languageInRoute] || languageInRoute
      const ev = new Event("change", { bubbles: true })
      selectInDom.dispatchEvent(ev)
    }
  }, [languageInRoute, googleTranslateDropdownElHasBeenRendered, disable])
}

export default useTranslate
