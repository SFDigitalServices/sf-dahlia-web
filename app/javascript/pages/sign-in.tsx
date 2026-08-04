import React from "react"
import { useFeatureFlag } from "../hooks/useFeatureFlag"

import { t } from "@bloom-housing/ui-components"

import { SignInForm } from "../authentication/SignInForm"
import { SignInFlow } from "../authentication/SignInFlow"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { AppPages } from "../util/routeUtil"
import { UNLEASH_FLAG } from "../modules/constants"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!flagsReady) {
    return null
  }

  if (clerkEnabled) {
    return <SignInFlow />
  }

  return (
    <FormsLayout title={t("pageTitle.signIn")}>
      <SignInForm />
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, { useFormTimeout: true, pageName: AppPages.SignIn })
