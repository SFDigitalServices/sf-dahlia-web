import { Field, Select, t } from "@bloom-housing/ui-components"
import { LoadingState } from "@bloom-housing/ui-seeds"
import React, { useEffect, useState } from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { getErrorMessage } from "./util"
import { getHousingCounselorAgencies, HousingCounselorAgency } from "../../../api/authApiService"
import styles from "./HousingCounselorAccess.module.scss"

export const housingCounselorFieldsetErrors: ErrorMessages = {
  "housingCounselingAgencyId:missing": {
    default: "accountSettings.housingCounselor.fieldError",
    abbreviated: "accountSettings.housingCounselor.fieldError",
  },
  "housingCounselorAgree:required": {
    default: "accountSettings.housingCounselor.checkboxError",
    abbreviated: "accountSettings.housingCounselor.banner.shortError",
  },
}

const ShareAccess = ({
  register,
  errors,
}: {
  register: UseFormMethods["register"]
  errors?: UseFormMethods["errors"]
}) => {
  const [agencies, setAgencies] = useState<HousingCounselorAgency[]>(null)

  useEffect(() => {
    void getHousingCounselorAgencies().then((agencies) => setAgencies(agencies ?? []))
  }, [])

  return (
    <LoadingState loading={!agencies}>
      <div>
        <p className="field-note">{t("accountSettings.housingCounselor.description")}</p>
        <Select
          id="housingCounselingAgencyId"
          name="housingCounselingAgencyId"
          label={t("accountSettings.housingCounselor.label")}
          placeholder={t("accountSettings.housingCounselor.placeholder")}
          options={(agencies || []).map((agency) => ({
            label: agency.Name,
            value: agency.Id,
          }))}
          register={register}
          error={!!errors?.housingCounselingAgencyId}
          errorMessage={
            errors?.housingCounselingAgencyId?.message &&
            getErrorMessage(
              errors.housingCounselingAgencyId.message as string,
              housingCounselorFieldsetErrors,
              false
            )
          }
          validation={{
            required: "housingCounselingAgencyId:missing",
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
    </LoadingState>
  )
}

const RevokeAccess = ({
  housingCounselorAgency,
  lastModified,
}: {
  housingCounselorAgency: string
  lastModified: string
}) => {
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
        sharedDate: lastModified,
      })}
    </div>
  )
}

const HousingCounselorAccess = ({
  register,
  errors,
  housingCounselorAgency,
  lastModified,
}: {
  register: UseFormMethods["register"]
  errors?: UseFormMethods["errors"]
  housingCounselorAgency?: string
  lastModified?: string
}) => {
  return (
    <Fieldset label={t("accountSettings.housingCounselor.heading")}>
      {housingCounselorAgency ? (
        <RevokeAccess housingCounselorAgency={housingCounselorAgency} lastModified={lastModified} />
      ) : (
        <ShareAccess register={register} errors={errors} />
      )}
    </Fieldset>
  )
}

export default HousingCounselorAccess
