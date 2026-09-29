import React from "react"
import { ForgotPasswordFlow } from "../authentication/ForgotPasswordFlow"
import { ForgotPasswordForm } from "../authentication/ForgotPasswordForm"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import withAppSetup from "../layouts/withAppSetup"
import { UNLEASH_FLAG } from "../modules/constants"
import { AppPages } from "../util/routeUtil"

const ForgotPassword = () => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!clerkEnabled) {
    return <ForgotPasswordForm />
  }

  return <ForgotPasswordFlow />
}

export default withAppSetup(ForgotPassword, {
  useFormTimeout: true,
  pageName: AppPages.ForgotPassword,
})
