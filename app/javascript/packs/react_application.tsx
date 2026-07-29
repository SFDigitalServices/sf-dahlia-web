// Must be imported before "react-on-rails" — prevents the automatic
// setTimeout(renderInit) so we can load translations first.
import "../util/deferReactOnRailsAutoRender"
import React from "react"
import ReactOnRails from "react-on-rails"
import { BrowserRouter, Route, Routes } from "react-router"
import "../components/base.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"
import RentDirectory from "../pages/listings/for-rent"
import BuyDirectory from "../pages/listings/for-sale"
import HomePage from "../pages"
import SignIn from "../pages/sign-in"
import ListingDetail from "../pages/listings/listing-detail"
import { getCurrentLanguage, LanguagePrefix, loadTranslations } from "../util/languageUtil"
import { getLocalizedPath } from "../util/routeUtil"
import HousingCounselors from "../pages/getAssistance/housing-counselors"
import HowToApply from "../pages/howToApply/how-to-apply"
import GetAssistance from "../pages/getAssistance/get-assistance"
import DocumentChecklist from "../pages/getAssistance/document-checklist"
import InviteToPage from "../pages/inviteTo/invite-to"
import AdditionalResources from "../pages/getAssistance/additional-resources"
import Disclaimer from "../pages/getAssistance/disclaimer"
import Privacy from "../pages/getAssistance/privacy"
import MyApplications from "../pages/account/my-applications" // eslint-disable-line import/no-named-as-default
import AccountSettings from "../pages/account/account-settings"
import MyAccount from "../pages/account/my-account" // eslint-disable-line import/no-named-as-default
import CreateAnAccount from "../pages/account/create-an-account"
import ForgotPassword from "../pages/forgot-password"
import ResetPassword from "../pages/reset-password"
import ListingApplyForm from "../pages/form/listing-apply-form"
import Account from "../pages/account/account"
import Applications from "../pages/account/applications"
import Settings from "../pages/account/settings"
import Contact from "../pages/account/contact"
import type { INVITE_TO_X } from "../modules/constants"

type InviteToUrlParams = {
  type?: INVITE_TO_X
  deadline?: string
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  isTest?: boolean | string
}

type ServerProps = {
  assetPaths: unknown
  documentsPath?: boolean
  urlParams?: InviteToUrlParams
  uploadUrl?: string
  schedulingUrl?: string
  submitPreviewLinkTokenParam?: string
}

// Add additional routes here for each React entrypoint
const PAGE_ROUTES = [
  [HomePage, "/"],
  [RentDirectory, "/listings/for-rent"],
  [BuyDirectory, "/listings/for-sale"],
  [ListingDetail, "/listings/:id"],
  [HowToApply, "/listings/:id/how-to-apply"],
  [ListingApplyForm, "/listings/:id/apply/intro"],
  [SignIn, "/sign-in"],
  [CreateAnAccount, "/create-account"],
  [ForgotPassword, "/forgot-password"],
  [ResetPassword, "/reset-password"],
  [HousingCounselors, "/housing-counselors"],
  [GetAssistance, "/get-assistance"],
  [DocumentChecklist, "/document-checklist"],
  [AdditionalResources, "/additional-resources"],
  [Privacy, "/privacy"],
  [Disclaimer, "/disclaimer"],
  [MyAccount, "/my-account"],
  [AccountSettings, "/account-settings"],
  [MyApplications, "/my-applications"],
  [Account, "/account"],
  [Applications, "/account/applications"],
  [Settings, "/account/settings"],
  [Contact, "/account/contact"],
] as const

const INVITE_TO_PATHS = [
  "/listings/:id/next-steps",
  "/listings/:id/next-steps/documents",
  "/listings/:id/invite-to-apply",
  "/listings/:id/invite-to-apply/documents",
] as const

// Register /en/path in addition to /path for English localization
const localizedPaths = (path: string): string[] => [
  ...Object.values(LanguagePrefix).map((lang) => getLocalizedPath(path, lang)),
  path === "/" ? `/${LanguagePrefix.English}` : `/${LanguagePrefix.English}${path}`,
]

// Non-React pages still use window.location.assign
const AngularRoute = () => {
  window.location.assign(window.location.href)
  return null
}

const App = (serverProps: ServerProps) => (
  <BrowserRouter>
    <Routes>
      {PAGE_ROUTES.flatMap(([Page, path]) =>
        localizedPaths(path).map((routePath) => (
          <Route
            key={routePath}
            path={routePath}
            element={<Page assetPaths={serverProps.assetPaths} />}
          />
        ))
      )}
      {INVITE_TO_PATHS.flatMap((p) =>
        localizedPaths(p).map((routePath) => (
          <Route
            key={routePath}
            path={routePath}
            element={<InviteToPage {...serverProps} urlParams={serverProps.urlParams ?? {}} />}
          />
        ))
      )}
      <Route path="*" element={<AngularRoute />} />
    </Routes>
  </BrowserRouter>
)

const currentLanguage = getCurrentLanguage(window.location.pathname)
/* eslint-disable-next-line unicorn/prefer-top-level-await */
void loadTranslations(currentLanguage).then(() => {
  ReactOnRails.register({ App })
  ReactOnRails.reactOnRailsPageLoaded()
})
