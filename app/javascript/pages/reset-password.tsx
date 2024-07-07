import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
interface ResetPasswordProps {
  assetPaths: unknown
}

const ResetPassword = (_props: ResetPasswordProps) => (
  <Heading> {t("pageTitle.resetPassword")}</Heading>
)

export default withAppSetup(ResetPassword, true)
