import WebpackerReact from "webpacker-react"

import "../pages/base.scss"
import DirectoryPage from "../pages/DirectoryPage"
import HomePage from "../pages/HomePage"
import SignIn from "../pages/SignIn"
import { getCurrentLanguage, loadTranslations } from "../util/languageUtil"

const currentLanguage = getCurrentLanguage(window.location.pathname)

void loadTranslations(currentLanguage).then(() =>
  WebpackerReact.setup({
    // Add additional components here for each react component entrypoint
    DirectoryPage,
    HomePage,
    SignIn,
  })
)
