import React from "react"

import { SignInForm } from "../authentication/SignInForm"
import { LoggedInUserIdleTimeout } from "../authentication/timeout"
import { UserProvider } from "../authentication/UserContext"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"

const SignIn = () => (
  <FormsLayout>
    <UserProvider>
      <LoggedInUserIdleTimeout onTimeout={() => console.log("Logout")} />
      <SignInForm />
    </UserProvider>
  </FormsLayout>
)

export default withAppSetup(SignIn)
