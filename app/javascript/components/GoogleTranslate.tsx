import React, { useEffect, useState } from "react"
import { getRoutePrefix } from "../util/languageUtil"

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

const languageMap = {
  zh: "zh-TW",
}

const GoogleTranslate = () => {
  const languageInRoute = window.location?.pathname && getRoutePrefix(window.location.pathname)
  const [selectEl, setSelectEl] = useState(null)

  useEffect(() => {
    /*
      This useEffect is checking for when the google translate elements get added to the dom
     */
    let iterations = 0

    /*
     * Poll every 1/3 second for 30 seconds checking for google translate to add language dropdown
     */
    const interval = setInterval(() => {
      iterations++
      const selectWithOptionInDom = document.querySelector("select.goog-te-combo option")
      const selectInDom = document.querySelector("select.goog-te-combo")

      /*
       * It seems the select and the options get added at different times.
       * We want to target the select for dispatching changes, but want to wait
       * until the options appear before dispatch.
       */
      if (selectWithOptionInDom && !selectEl) {
        setSelectEl(selectInDom)
        clearInterval(interval)
      }
      if (iterations > 90) {
        clearInterval(interval)
      }
    }, 300)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    /*
     * This useeffect is for adding the script tag for google translate
     */
    const script = document.createElement("script")
    script.src = "//translate.google.com/translate_a/element.js?cb=initGoogleTranslate"
    document.body.append(script)
    tWindow.initGoogleTranslate = initGoogleTranslate
    return () => {
      script.remove()
    }
  }, [])

  useEffect(() => {
    /*
     * This useeffect is to change the selected language from the dropdown that google translate
     * renders (the dropdown gets hidden fyi)
     */
    if (languageInRoute && selectEl) {
      selectEl.value = languageMap[languageInRoute] || languageInRoute
      const ev = new Event("change", { bubbles: true })
      selectEl.dispatchEvent(ev)
    }
  }, [languageInRoute, selectEl])

  return <></>
}

export default GoogleTranslate
