import React from "react"
import { t } from "@bloom-housing/ui-components"
import SuccessToast from "./SuccessToast"

interface HousingCounselorToastProps {
  seekerName: string
}

export const HousingCounselorSignInToast = ({ seekerName }: HousingCounselorToastProps) => (
  <SuccessToast>{t("housingCounselor.signedInToast", { seekerName })}</SuccessToast>
)

export const HousingCounselorSignOutToast = ({ seekerName }: HousingCounselorToastProps) => (
  <SuccessToast>{t("housingCounselor.signedOutToast", { seekerName })}</SuccessToast>
)

export const HousingCounselorNoAccessToast = () => (
  <SuccessToast variant="error">{t("housingCounselor.noAccess")}</SuccessToast>
)
