import React from "react"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"

const SignIn = () => (
  <FormsLayout>
    <SignInForm />
  </FormsLayout>
)

export default withAppSetup(SignIn)
