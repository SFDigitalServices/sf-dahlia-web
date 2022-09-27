import React, { useEffect, useState } from "react"
import { getRoutePrefix } from "../util/languageUtil"

const languageMap = {
  zh: "zh-TW",
}

const GoogleTranslate = () => {
  const languageInRoute = window.location?.pathname && getRoutePrefix(window.location.pathname)
  const [selectEl, setSelectEl] = useState(null)
  const [changeEventHappening, setChangeEventHappening] = useState(false)

  useEffect(() => {
    /*
     * need to wait for scripts to load
     * could potentially get thrown on the event loop later than this gets mounted
     * TODO - do it anytime that it changes
     */

    const select = document.querySelector("select.goog-te-combo")
    setSelectEl(select)
  }, [])

  useEffect(() => {
    if (languageInRoute && selectEl && !changeEventHappening) {
      setChangeEventHappening(true)
      selectEl.value = languageMap[languageInRoute] || languageInRoute
      const ev = new Event("change", { bubbles: true })
      selectEl.dispatchEvent(ev)
    }

    /*
     * undefined languageInRoute is english
     */
    if (!languageInRoute && selectEl && !changeEventHappening) {
      setChangeEventHappening(true)
      selectEl.value = "en"
      const ev = new Event("change", { bubbles: true })
      selectEl.dispatchEvent(ev)
    }
    /*
     * Need to leverage dep array vars instead of empty array
     * (only invoked once after component mounts) because we
     * shouldn't count on google translate scripts being loaded
     * before component mounts
     */
  }, [languageInRoute, selectEl, changeEventHappening])

  return <></>
}

export default GoogleTranslate
