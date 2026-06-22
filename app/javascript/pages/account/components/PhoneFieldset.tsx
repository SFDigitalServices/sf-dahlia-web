/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { Field, ErrorMessage, Select, t } from "@bloom-housing/ui-components"
import { useFormContext, ErrorOption } from "react-hook-form"
import Fieldset from "./Fieldset"
import { PhoneMask } from "./PhoneMask"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./util"
import styles from "./PhoneFieldset.module.scss"

export interface PhoneFormValues {
  phone: string
  phoneType: string
  noPhone: boolean
  additionalPhoneCheckbox: boolean
  additionalPhone: string
  additionalPhoneType: string
}

export const handlePhoneServerErrors = (
  _error: ExpandedAccountAxiosError
): [keyof PhoneFormValues, ErrorOption] => {
  return ["phone", { message: "phone:server:generic", shouldFocus: true }]
}

export const phoneFieldsetErrors: ErrorMessages = {
  "phone:missing": {
    default: "accountLayout.contact.errorMissing",
    abbreviated: "accountLayout.contact.errorMissing",
  },
  "phone:type": {
    default: "accountLayout.contact.errorType",
    abbreviated: "accountLayout.contact.errorType",
  },
  "phone:invalid": {
    default: "accountLayout.contact.errorPhone",
    abbreviated: "accountLayout.contact.errorPhoneBanner",
  },
  "phone:server:generic": {
    default: "error.account.genericServerError",
    abbreviated: "error.account.genericServerError.abbreviated",
  },
}

const phoneValidation = (required: boolean) => (value: string) => {
  if (!required) return true
  const digits = (value?.match(/\d/g) ?? []).length
  if (!digits) return "phone:missing"
  if (digits !== 10) return "phone:invalid"
  return true
}

const PhoneFieldset = () => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useFormContext<PhoneFormValues>()

  const noPhone = watch("noPhone", false)
  const hasAdditionalPhone = watch("additionalPhoneCheckbox", false)
  const phoneTypeOptions = [
    { label: t("label.phoneCell"), value: "Cell" },
    { label: t("label.phoneHome"), value: "Home" },
    { label: t("label.phoneWork"), value: "Work" },
  ]

  const renderPhoneField = (
    name: "phone" | "additionalPhone",
    required: boolean,
    disabled: boolean
  ) => (
    <div className={`field ${errors[name] ? "error" : ""}`}>
      <div className="control">
        <PhoneMask
          name={name}
          aria-label={
            name === "phone"
              ? t("accountLayout.contact.phoneLabel")
              : t("label.applicantAdditionalPhone")
          }
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          aria-invalid={!!errors[name]}
          ref={register({ validate: phoneValidation(required) })}
          disabled={disabled}
        />
      </div>
      {errors[name]?.message && (
        <ErrorMessage id={`${name}-error`} error>
          {getErrorMessage(errors[name].message, phoneFieldsetErrors, false)}
        </ErrorMessage>
      )}
    </div>
  )

  return (
    <Fieldset
      hasError={["phone", "phoneType", "additionalPhone", "additionalPhoneType"].some(
        (name) => errors[name]
      )}
      label={t("accountLayout.contact.phoneLabel")}
    >
      {renderPhoneField("phone", !noPhone, noPhone)}
      <Select
        name="phoneType"
        label={t("label.whatTypeOfNumber")}
        labelClassName={styles.fieldLabel}
        options={phoneTypeOptions}
        disabled={noPhone}
        defaultValue={watch("phoneType")}
        error={!!errors.phoneType}
        errorMessage={
          errors.phoneType?.message &&
          getErrorMessage(errors.phoneType.message, phoneFieldsetErrors, false)
        }
        register={register}
        validation={{
          validate: (value: string) => (noPhone || value ? true : "phone:type"),
        }}
        controlClassName="control"
      />
      <span className={styles.checkboxGroup}>
        <Field
          type="checkbox"
          name="noPhone"
          register={register}
          label={t("label.applicantNoPhone")}
          className={styles.checkboxLabel}
          disabled={hasAdditionalPhone}
          onChange={(e) => {
            if (e.target.checked) {
              setValue("phone", "")
              setValue("phoneType", "")
              clearErrors(["phone", "phoneType"])
            }
          }}
        />
        <Field
          type="checkbox"
          name="additionalPhoneCheckbox"
          register={register}
          label={t("label.applicantAdditionalPhone")}
          className={styles.checkboxLabel}
          disabled={noPhone}
          onChange={(e) => {
            if (!e.target.checked) {
              setValue("additionalPhone", "")
              setValue("additionalPhoneType", "")
              clearErrors(["additionalPhone", "additionalPhoneType"])
            }
          }}
        />
      </span>
      {hasAdditionalPhone && (
        <div className={styles.additionalPhoneFields}>
          {renderPhoneField("additionalPhone", true, false)}
          <Select
            name="additionalPhoneType"
            label={t("label.whatTypeOfNumber")}
            labelClassName={styles.fieldLabel}
            options={phoneTypeOptions}
            defaultValue={watch("additionalPhoneType")}
            error={!!errors.additionalPhoneType}
            errorMessage={
              errors.additionalPhoneType?.message &&
              getErrorMessage(errors.additionalPhoneType.message, phoneFieldsetErrors, false)
            }
            register={register}
            validation={{
              validate: (value: string) => (value ? true : "phone:type"),
            }}
            controlClassName="control"
          />
        </div>
      )}
    </Fieldset>
  )
}

export default PhoneFieldset
