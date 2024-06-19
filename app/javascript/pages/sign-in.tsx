import React from "react"

import { t } from "@bloom-housing/ui-components"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"

const SignIn = () => (
  <FormsLayout title={t("pageTitle.signIn")}>
    <SignInForm />
  </FormsLayout>
)

// useFormTimeout Todo

export default SignIn
