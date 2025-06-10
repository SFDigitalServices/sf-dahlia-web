import React from "react"
import { useFeatureFlag } from "../hooks/useFeatureFlag"

import { t } from "@bloom-housing/ui-components"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { AppPages } from "../util/routeUtil"
import { UNLEASH_FLAG } from "../modules/constants"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  if (clerkEnabled) {
    console.log("Clerk authentication is enabled.")
  }
  return (
    <FormsLayout title={t("pageTitle.signIn")}>
      <SignInForm />
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, { useFormTimeout: true, pageName: AppPages.SignIn })
