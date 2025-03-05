import React from "react"

import { t } from "@bloom-housing/ui-components"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { AppPages } from "../util/routeUtil"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  return (
    <FormsLayout title={t("pageTitle.signIn")}>
      <SignInForm />
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, { useFormTimeout: true, pageName: AppPages.SignIn })
