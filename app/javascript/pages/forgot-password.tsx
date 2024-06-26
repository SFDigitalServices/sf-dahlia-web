import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
interface ForgotPasswordProps {
  assetPaths: unknown
}

const ForgotPassword = (_props: ForgotPasswordProps) => (
  <Heading> {t("pageTitle.forgotPassword")}</Heading>
)

export default withAppSetup(ForgotPassword, true)
