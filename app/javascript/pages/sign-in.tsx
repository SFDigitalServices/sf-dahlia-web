import React from "react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"

import { t } from "@bloom-housing/ui-components"

import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { AppPages } from "../util/routeUtil"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  return (
    <FormsLayout title={t("pageTitle.signIn")}>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, { useFormTimeout: true, pageName: AppPages.SignIn })
