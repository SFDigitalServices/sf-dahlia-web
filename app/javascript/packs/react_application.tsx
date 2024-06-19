import ReactOnRails from "react-on-rails"

import "../components/base.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"

import HomePage from "../pages"
import { getCurrentLanguage, loadTranslations } from "../util/languageUtil"

const currentLanguage = getCurrentLanguage(window.location.pathname)

void loadTranslations(currentLanguage).then(() =>
  ReactOnRails.register({
    // Add additional components here for each react component entrypoint
    HomePage,
    // SignIn,
  })
)
