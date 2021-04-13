import { addTranslation } from "@bloom-housing/ui-components"
import * as translation from "@bloom-housing/ui-components/src/locales/general.json"
import WebpackerReact from "webpacker-react"

import * as customTranslations from "../page_content/locale_overrides/general.json"
import "../pages/base.scss"
import HomePage from "../pages/HomePage"
import { SignIn } from "../pages/SignIn"

addTranslation(translation)
if (customTranslations) {
  addTranslation(customTranslations)
}

WebpackerReact.setup({
  // Add additional components here for each react component entrypoint
  HomePage,
  SignIn,
})
