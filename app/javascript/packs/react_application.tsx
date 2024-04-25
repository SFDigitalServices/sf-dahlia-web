import ReactOnRails from "react-on-rails"

import "../components/base.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"

import RentDirectory from "../pages/listings/for-rent"
import BuyDirectory from "../pages/listings/for-sale"
import HomePage from "../pages"
import SignIn from "../pages/sign-in"
import ListingDetail from "../pages/listings/listing-detail"
import { getCurrentLanguage, loadTranslations } from "../util/languageUtil"
import HousingCounselors from "../pages/getAssistance/housing-counselors"
import GetAssistance from "../pages/getAssistance/get-assistance"
import DocumentChecklist from "../pages/getAssistance/document-checklist"
import ConfirmingEmail from "../pages/confirmingEmail/confirming-email"
import AdditionalResources from "../pages/getAssistance/additional-resources"
import Disclaimer from "../pages/getAssistance/disclaimer"
import Privacy from "../pages/getAssistance/privacy"

const currentLanguage = getCurrentLanguage(window.location.pathname)

void loadTranslations(currentLanguage).then(() =>
  ReactOnRails.register({
    // Add additional components here for each react component entrypoint
    BuyDirectory,
    HomePage,
    ListingDetail,
    RentDirectory,
    SignIn,
    HousingCounselors,
    GetAssistance,
    DocumentChecklist,
    AdditionalResources,
    Disclaimer,
    Privacy,
    ConfirmingEmail,
  })
)
