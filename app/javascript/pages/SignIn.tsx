import React from "react"

import { SignInForm } from "../authentication/SignInForm"
import { LoggedInUserIdleTimeout } from "../authentication/timeout"
import { UserProvider } from "../authentication/UserContext"
import FormsLayout from "../layouts/Forms"

const SignIn = () => {
  return (
    <FormsLayout>
      <UserProvider>
        <LoggedInUserIdleTimeout onTimeout={() => console.log("Logout")} />
        <SignInForm />
      </UserProvider>
    </FormsLayout>
  )
}

export { SignIn as default, SignIn }
