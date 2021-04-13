import React from "react"

import { SignInForm } from "../authentication/SignInForm"
import { UserProvider } from "../authentication/UserContext"
import FormsLayout from "../layouts/Forms"

const SignIn = () => {
  return (
    <FormsLayout>
      <UserProvider>
        <SignInForm />
      </UserProvider>
    </FormsLayout>
  )
}

export { SignIn as default, SignIn }
