// Must be imported before "react-on-rails" — prevents the automatic
// setTimeout(renderInit) so we can load translations first.
import "../util/deferReactOnRailsAutoRender"
import React from "react"
import ReactOnRails from "react-on-rails"
import { BrowserRouter, Route, Routes } from "react-router"
import "../components/base.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"
import { RentDirectory } from "../pages/listings/for-rent"
import { SaleDirectory } from "../pages/listings/for-sale"
import { HomePage } from "../pages" // ../pages/index.tsx
import { SignIn } from "../pages/sign-in"
import { ListingDetail } from "../pages/listings/listing-detail"
import { getCurrentLanguage, LanguagePrefix, loadTranslations } from "../util/languageUtil"
import { AppPages, getLocalizedPath, RedirectType } from "../util/routeUtil"
import { HousingCounselors } from "../pages/getAssistance/housing-counselors"
import { HowToApply } from "../pages/howToApply/how-to-apply"
import { GetAssistance } from "../pages/getAssistance/get-assistance"
import { DocumentChecklist } from "../pages/getAssistance/document-checklist"
import { InviteToPage } from "../pages/inviteTo/invite-to"
import { AdditionalResources } from "../pages/getAssistance/additional-resources"
import { Disclaimer } from "../pages/getAssistance/disclaimer"
import { Privacy } from "../pages/getAssistance/privacy"
import { MyApplications } from "../pages/account/my-applications"
import { AccountSettingsPage } from "../pages/account/account-settings"
import { MyAccount } from "../pages/account/my-account"
import { CreateAnAccount } from "../pages/account/create-an-account"
import { EnterVerificationCode } from "../pages/account/verification-code"
import { AddPassword } from "../pages/account/add-password"
import { AddProfile } from "../pages/account/add-profile"
import { ChangePassword } from "../pages/account/change-password"
import { ForgotPassword } from "../pages/forgot-password"
import { ResetPassword } from "../pages/reset-password"
import { ListingApplyForm } from "../pages/form/listing-apply-form"
import { Account } from "../pages/account/account"
import { Applications } from "../pages/account/applications"
import { Settings } from "../pages/account/settings"
import { Contact } from "../pages/account/contact"
import { UpdateEmail } from "../pages/account/update-email"
import { AppSetupConfig, AppSetupWrapper } from "../layouts/withAppSetup"
import { ProtectedRouteWrapper } from "../authentication/withAuthentication"
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

type RouteDefinition = {
  path: string
  setup: AppSetupConfig
  redirectType?: RedirectType
  render: (serverProps: ServerProps) => React.ReactElement
}

const renderWithAssetPaths =
  <P extends { assetPaths?: unknown }>(Page: React.ComponentType<P>) =>
  (serverProps: ServerProps): React.ReactElement => (
    <Page {...({ assetPaths: serverProps.assetPaths } as P)} />
  )

const PAGE_ROUTES: RouteDefinition[] = [
  { path: "/", setup: { pageName: AppPages.Home }, render: renderWithAssetPaths(HomePage) },
  {
    path: "/listings/for-rent",
    setup: { pageName: AppPages.RentalDirectory },
    render: renderWithAssetPaths(RentDirectory),
  },
  {
    path: "/listings/for-sale",
    setup: { pageName: AppPages.SaleDirectory },
    render: renderWithAssetPaths(SaleDirectory),
  },
  {
    path: "/listings/:id",
    setup: { pageName: AppPages.ListingDetail },
    render: renderWithAssetPaths(ListingDetail),
  },
  {
    path: "/listings/:id/how-to-apply",
    setup: { pageName: AppPages.HowToApply },
    render: renderWithAssetPaths(HowToApply),
  },
  {
    path: "/listings/:id/apply/intro",
    setup: { pageName: AppPages.ListingApplyForm },
    render: renderWithAssetPaths(ListingApplyForm),
  },
  {
    path: "/sign-in",
    setup: { useFormTimeout: true, pageName: AppPages.SignIn },
    render: renderWithAssetPaths(SignIn),
  },
  {
    path: "/sign-in/code",
    setup: { useFormTimeout: true, pageName: AppPages.EnterVerificationCode },
    render: renderWithAssetPaths(EnterVerificationCode),
  },
  {
    path: "/create-account",
    setup: { useFormTimeout: true, pageName: AppPages.CreateAccount },
    render: renderWithAssetPaths(CreateAnAccount),
  },
  {
    path: "/create-account/code",
    setup: { useFormTimeout: true, pageName: AppPages.EnterVerificationCode },
    render: renderWithAssetPaths(EnterVerificationCode),
  },
  {
    path: "/add-password",
    setup: { useFormTimeout: true, pageName: AppPages.AddPassword },
    render: renderWithAssetPaths(AddPassword),
  },
  {
    path: "/add-profile",
    setup: { useFormTimeout: true, pageName: AppPages.AddProfile },
    render: renderWithAssetPaths(AddProfile),
  },
  {
    path: "/forgot-password",
    setup: { useFormTimeout: true, pageName: AppPages.ForgotPassword },
    render: renderWithAssetPaths(ForgotPassword),
  },
  {
    path: "/forgot-password/code",
    setup: { useFormTimeout: true, pageName: AppPages.EnterVerificationCode },
    render: renderWithAssetPaths(EnterVerificationCode),
  },
  {
    path: "/change-password",
    setup: { useFormTimeout: true, pageName: AppPages.ChangePassword },
    render: renderWithAssetPaths(ChangePassword),
  },
  {
    path: "/reset-password",
    setup: { useFormTimeout: true, pageName: AppPages.ResetPassword },
    render: renderWithAssetPaths(ResetPassword),
  },
  {
    path: "/housing-counselors",
    setup: { pageName: AppPages.HousingCounselors },
    render: renderWithAssetPaths(HousingCounselors),
  },
  {
    path: "/get-assistance",
    setup: { pageName: AppPages.GetAssistance },
    render: renderWithAssetPaths(GetAssistance),
  },
  {
    path: "/document-checklist",
    setup: { pageName: AppPages.DocumentChecklist },
    render: renderWithAssetPaths(DocumentChecklist),
  },
  {
    path: "/additional-resources",
    setup: { pageName: AppPages.AdditionalResources },
    render: renderWithAssetPaths(AdditionalResources),
  },
  {
    path: "/privacy",
    setup: { pageName: AppPages.PrivacyPolicy },
    render: renderWithAssetPaths(Privacy),
  },
  {
    path: "/disclaimer",
    setup: { pageName: AppPages.Disclaimer },
    render: renderWithAssetPaths(Disclaimer),
  },
  {
    path: "/update-email",
    setup: { useFormTimeout: true, pageName: AppPages.UpdateEmail },
    render: renderWithAssetPaths(UpdateEmail),
  },
  {
    path: "/update-email/code",
    setup: { useFormTimeout: true, pageName: AppPages.EnterVerificationCode },
    render: renderWithAssetPaths(EnterVerificationCode),
  },
]

const PROTECTED_PAGE_ROUTES: RouteDefinition[] = [
  {
    path: "/account",
    setup: { pageName: AppPages.Account },
    redirectType: RedirectType.Account,
    render: renderWithAssetPaths(Account),
  },
  {
    path: "/my-account",
    setup: { pageName: AppPages.MyAccount },
    redirectType: RedirectType.Account,
    render: renderWithAssetPaths(MyAccount),
  },
  {
    path: "/account-settings",
    setup: { pageName: AppPages.AccountSettings },
    redirectType: RedirectType.Settings,
    render: renderWithAssetPaths(AccountSettingsPage),
  },
  {
    path: "/my-applications",
    setup: { pageName: AppPages.MyApplications },
    redirectType: RedirectType.Applications,
    render: renderWithAssetPaths(MyApplications),
  },
  {
    path: "/account/applications",
    setup: { pageName: AppPages.Applications },
    redirectType: RedirectType.Applications,
    render: renderWithAssetPaths(Applications),
  },
  {
    path: "/account/settings",
    setup: { pageName: AppPages.AccountSettings },
    redirectType: RedirectType.Settings,
    render: renderWithAssetPaths(Settings),
  },
  {
    path: "/account/contact",
    setup: { pageName: AppPages.Contact },
    redirectType: RedirectType.Account,
    render: renderWithAssetPaths(Contact),
  },
]

const INVITE_TO_PATHS = [
  "/listings/:id/next-steps",
  "/listings/:id/next-steps/documents",
  "/listings/:id/invite-to-apply",
  "/listings/:id/invite-to-apply/documents",
] as const

const INVITE_TO_ROUTES: RouteDefinition[] = INVITE_TO_PATHS.map((path) => ({
  path,
  setup: { pageName: AppPages.InviteTo },
  render: (serverProps: ServerProps) => (
    <InviteToPage {...serverProps} urlParams={serverProps.urlParams ?? {}} />
  ),
}))

const APP_ROUTES: RouteDefinition[] = [
  ...PAGE_ROUTES,
  ...PROTECTED_PAGE_ROUTES,
  ...INVITE_TO_ROUTES,
]

// Non-React pages still use window.location.assign
const AngularRoute = () => {
  window.location.assign(window.location.href)
  return null
}

// Register /en/path in addition to /path for English localization
const localizedPaths = (path: string): string[] => [
  ...Object.values(LanguagePrefix).map((lang) => getLocalizedPath(path, lang)),
  path === "/" ? `/${LanguagePrefix.English}` : `/${LanguagePrefix.English}${path}`,
]

const renderRouteElement = (
  route: RouteDefinition,
  serverProps: ServerProps
): React.ReactElement => {
  return route.redirectType ? (
    <ProtectedRouteWrapper redirectType={route.redirectType}>
      {route.render(serverProps)}
    </ProtectedRouteWrapper>
  ) : (
    route.render(serverProps)
  )
}

const App = (serverProps: ServerProps) => (
  <BrowserRouter>
    <Routes>
      {APP_ROUTES.flatMap((route) =>
        localizedPaths(route.path).map((routePath) => (
          <Route
            key={routePath}
            path={routePath}
            element={
              <AppSetupWrapper
                assetPaths={serverProps.assetPaths}
                useFormTimeout={route.setup.useFormTimeout}
                pageName={route.setup.pageName}
              >
                {renderRouteElement(route, serverProps)}
              </AppSetupWrapper>
            }
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
