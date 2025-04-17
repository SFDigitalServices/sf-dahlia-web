import ReactOnRails from "react-on-rails"
import { ClerkProvider } from "@clerk/clerk-react"
import React from "react"

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
import HowToApply from "../pages/howToApply/how-to-apply"
import GetAssistance from "../pages/getAssistance/get-assistance"
import DocumentChecklist from "../pages/getAssistance/document-checklist"
import ListingInterestPage from "../pages/listingInterest/listing-interest-page"
import AdditionalResources from "../pages/getAssistance/additional-resources"
import Disclaimer from "../pages/getAssistance/disclaimer"
import Privacy from "../pages/getAssistance/privacy"
import MyApplications from "../pages/account/my-applications"
import AccountSettings from "../pages/account/account-settings"
import MyAccount from "../pages/account/my-account"
import CreateAccount from "../pages/account/create-account"
import ForgotPassword from "../pages/forgot-password"
import ResetPassword from "../pages/reset-password"

const currentLanguage = getCurrentLanguage(window.location.pathname)

const clerkKey = "pk_test_aW5mb3JtZWQtc29sZS04NS5jbGVyay5hY2NvdW50cy5kZXYk"
if (!clerkKey) {
  throw new Error("Missing Clerk API key.")
}

void loadTranslations(currentLanguage).then(() =>
  ReactOnRails.register({
    // Add additional components here for each react component entrypoint
    BuyDirectory: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <BuyDirectory {...props} />
      </ClerkProvider>
    ),
    HomePage: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <HomePage {...props} />
      </ClerkProvider>
    ),
    ListingDetail: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <ListingDetail {...props} />
      </ClerkProvider>
    ),
    RentDirectory: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <RentDirectory {...props} />
      </ClerkProvider>
    ),
    SignIn: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <SignIn {...props} />
      </ClerkProvider>
    ),
    CreateAccount: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <CreateAccount {...props} />
      </ClerkProvider>
    ),
    ForgotPassword: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <ForgotPassword {...props} />
      </ClerkProvider>
    ),
    ResetPassword: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <ResetPassword {...props} />
      </ClerkProvider>
    ),
    HousingCounselors: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <HousingCounselors {...props} />
      </ClerkProvider>
    ),
    HowToApply: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <HowToApply {...props} />
      </ClerkProvider>
    ),
    GetAssistance: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <GetAssistance {...props} />
      </ClerkProvider>
    ),
    DocumentChecklist: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <DocumentChecklist {...props} />
      </ClerkProvider>
    ),
    AdditionalResources: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <AdditionalResources {...props} />
      </ClerkProvider>
    ),
    Disclaimer: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <Disclaimer {...props} />
      </ClerkProvider>
    ),
    Privacy: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <Privacy {...props} />
      </ClerkProvider>
    ),
    ListingInterestPage: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <ListingInterestPage {...props} />
      </ClerkProvider>
    ),
    MyApplications: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <MyApplications {...props} />
      </ClerkProvider>
    ),
    AccountSettings: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <AccountSettings {...props} />
      </ClerkProvider>
    ),
    MyAccount: (props) => (
      <ClerkProvider publishableKey={clerkKey}>
        <MyAccount {...props} />
      </ClerkProvider>
    ),
  })
)
