import React from "react"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => (
  <FormsLayout>
    <SignInForm />
  </FormsLayout>
)

export default withAppSetup(SignIn, true)
