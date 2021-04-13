import { addTranslation } from "@sf-digital-services/ui-components"
import WebpackerReact from "webpacker-react"

import en from "../../assets/json/translations/locale-en.json"
import es from "../../assets/json/translations/locale-es.json"
import tl from "../../assets/json/translations/locale-tl.json"
import zh from "../../assets/json/translations/locale-zh.json"
import "../pages/base.scss"
import HomePage from "../pages/HomePage"
import { getCurrentLanguage } from "../util/languageUtil"

const currentLanguage = getCurrentLanguage()

addTranslation(en.en)
if (currentLanguage === "es") {
  addTranslation(es.es)
} else if (currentLanguage === "zh") {
  addTranslation(zh.zh)
} else if (currentLanguage === "tl") {
  addTranslation(tl.tl)
}

WebpackerReact.setup({
  // Add additional components here for each react component entrypoint
  HomePage,
})
