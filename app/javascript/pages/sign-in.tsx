import React from "react"
import { SignInForm } from "../authentication/SignInForm"
import { ClerkSignInForm } from "../authentication/ClerkSignInForm"

import { t } from "@bloom-housing/ui-components"

import Layout from "../layouts/Layout"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { AppPages } from "../util/routeUtil"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  //const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const clerkEnabled = true
  if (clerkEnabled) {
    console.log("Clerk authentication is enabled.")
  }
  return clerkEnabled ? (
    <Layout title={t("pageTitle.signIn")}>
      <ClerkSignInForm />
    </Layout>
  ) : (
    <FormsLayout title={t("pageTitle.signIn")}>
      <SignInForm />
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, { useFormTimeout: true, pageName: AppPages.SignIn })
