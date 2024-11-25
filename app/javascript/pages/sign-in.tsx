import React, { useEffect, useState } from "react"

import { t } from "@bloom-housing/ui-components"

import { SignInForm } from "../authentication/SignInForm"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
interface SignInProps {
  assetPaths: unknown
}

const SignIn = (_props: SignInProps) => {
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(null)

  useEffect(() => {
    const isRedirect = window.sessionStorage.getItem("redirect")
    if (isRedirect === "true") {
      setShowEmailConfirmationModal(true)
      window.sessionStorage.removeItem("redirect")
    }
  }, [])

  if (showEmailConfirmationModal) {
    // TODO: https://sfgovdt.jira.com/browse/DAH-2881
    window.alert("Email confirmation modal will show!")
  }

  return (
    <FormsLayout title={t("pageTitle.signIn")}>
      <SignInForm />
    </FormsLayout>
  )
}

export default withAppSetup(SignIn, true)
