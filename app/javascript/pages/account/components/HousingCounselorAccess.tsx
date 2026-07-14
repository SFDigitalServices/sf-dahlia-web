import { Field, Select, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { getErrorMessage } from "./util"
import { localizedFormat } from "../../../util/languageUtil"
import styles from "./HousingCounselorAccess.module.scss"

export const housingCounselorFieldsetErrors: ErrorMessages = {
  "housingCounselorAgency:missing": {
    default: "accountSettings.housingCounselor.fieldError",
    abbreviated: "accountSettings.housingCounselor.fieldError",
  },
  "housingCounselorAgree:required": {
    default: "accountSettings.housingCounselor.checkboxError",
    abbreviated: "accountSettings.housingCounselor.banner.shortError",
  },
}

const testHousingCounselors = [
  { label: "Test Agency A", value: "Test Agency A" },
  { label: "Test Agency B", value: "Test Agency B" },
]

const ShareAccess = ({
  register,
  errors,
}: {
  register: UseFormMethods["register"]
  errors?: UseFormMethods["errors"]
}) => {
  return (
    <div>
      <p className="field-note">{t("accountSettings.housingCounselor.description")}</p>
      <Select
        id="housingCounselorAgency"
        name="housingCounselorAgency"
        label={t("accountSettings.housingCounselor.label")}
        placeholder={t("accountSettings.housingCounselor.placeholder")}
        options={testHousingCounselors}
        register={register}
        error={!!errors?.housingCounselorAgency}
        errorMessage={
          errors?.housingCounselorAgency?.message &&
          getErrorMessage(
            errors.housingCounselorAgency.message as string,
            housingCounselorFieldsetErrors,
            false
          )
        }
        validation={{
          required: "housingCounselorAgency:missing",
        }}
        controlClassName="control"
      />
      <div>
        <p>{t("accountSettings.housingCounselor.p1")}</p>
        <ul className={styles.hcList}>
          <li>{t("accountSettings.housingCounselor.p2")}</li>
          <li>{t("accountSettings.housingCounselor.p3")}</li>
          <li>{t("accountSettings.housingCounselor.p4")}</li>
        </ul>
      </div>
      <Field
        type="checkbox"
        name="housingCounselorCheckbox"
        label={t("accountSettings.housingCounselor.checkbox")}
        register={register}
        error={!!errors?.housingCounselorCheckbox}
        errorMessage={
          errors?.housingCounselorCheckbox?.message &&
          getErrorMessage(
            errors.housingCounselorCheckbox.message as string,
            housingCounselorFieldsetErrors,
            false
          )
        }
        validation={{
          required: "housingCounselorAgree:required",
        }}
      />
    </div>
  )
}

const RevokeAccess = ({ housingCounselorAgency }: { housingCounselorAgency: string }) => {
  return (
    <div className="field-note">
      <p className={styles.hcSharedWith}>
        {t("accountSettings.housingCounselor.sharedWith", { agencyName: housingCounselorAgency })}
      </p>
      <p>
        {t("accountSettings.housingCounselor.agencyCan", { agencyName: housingCounselorAgency })}
      </p>
      <ul className={styles.hcList}>
        <li>{t("accountSettings.housingCounselor.p2")}</li>
        <li>{t("accountSettings.housingCounselor.p3")}</li>
        <li>{t("accountSettings.housingCounselor.p4")}</li>
      </ul>
      {t("accountSettings.housingCounselor.sharedOn", {
        sharedDate: localizedFormat(new Date(), "MMMM D, YYYY [at] h:mm A"),
      })}
    </div>
  )
}

const HousingCounselorAccess = ({
  register,
  errors,
  housingCounselorAgency,
}: {
  register: UseFormMethods["register"]
  errors?: UseFormMethods["errors"]
  housingCounselorAgency?: string
}) => {
  return (
    <Fieldset label={t("accountSettings.housingCounselor.heading")}>
      {housingCounselorAgency ? (
        <RevokeAccess housingCounselorAgency={housingCounselorAgency} />
      ) : (
        <ShareAccess register={register} errors={errors} />
      )}
    </Fieldset>
  )
}

export default HousingCounselorAccess
