import WebpackerReact from "webpacker-react"

import "../components/base.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"

import RentDirectory from "../pages/listings/for-rent"
import BuyDirectory from "../pages/listings/for-sale"
import HomePage from "../pages"
import SignIn from "../pages/sign-in"
import ListingDetail from "../pages/listings/listing-detail"
import { getCurrentLanguage, loadTranslations } from "../util/languageUtil"

const currentLanguage = getCurrentLanguage(window.location.pathname)

void loadTranslations(currentLanguage).then(() =>
  WebpackerReact.setup({
    // Add additional components here for each react component entrypoint
    BuyDirectory,
    HomePage,
    ListingDetail,
    RentDirectory,
    SignIn,
  })
)
