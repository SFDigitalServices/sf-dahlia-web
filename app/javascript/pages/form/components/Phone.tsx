/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field, PhoneField } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
import Select from "./Select"

interface PhoneProps {
  label: string
  showTypeOfNumber?: boolean
  showDontHavePhoneNumber?: boolean
  showAdditionalPhoneNumber?: boolean
  labelForAdditionalPhoneNumber?: string
  fieldNames: {
    phone: string
    additionalPhone?: string
    phoneType?: string
    additionalPhoneType?: string
    noPhoneCheckbox?: string
    additionalPhoneCheckbox?: string
  }
}

const Phone = ({
  label,
  showTypeOfNumber,
  showDontHavePhoneNumber,
  showAdditionalPhoneNumber,
  labelForAdditionalPhoneNumber,
  fieldNames: {
    phone,
    additionalPhone,
    noPhoneCheckbox,
    additionalPhoneCheckbox,
    phoneType,
    additionalPhoneType,
  },
}: PhoneProps) => {
  const {
    control,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
    register,
  } = useFormContext()

  const noPhoneCheckboxValue = watch(noPhoneCheckbox, false)
  const additionalPhoneCheckboxValue = watch(additionalPhoneCheckbox, false)

  return (
    <fieldset>
      <legend className="legend-header">{t(label)}</legend>
      <PhoneField
        name={phone}
        control={control}
        disabled={noPhoneCheckboxValue}
        required={true}
        error={!!errors?.[phone]}
        errorMessage={t("error.phoneNumber")}
        controlClassName="control"
      />
      {showTypeOfNumber && (
        <Select
          fieldName={phoneType}
          label={t("label.whatTypeOfNumber")}
          options={[
            { name: t("label.phoneCell"), value: "cell" },
            { name: t("label.phoneHome"), value: "home" },
            { name: t("label.phoneWork"), value: "work" },
          ]}
          disabled={noPhoneCheckboxValue}
          errorMessage={t("error.phoneNumberType")}
          validation={{
            required: !noPhoneCheckboxValue,
          }}
        />
      )}
      {showDontHavePhoneNumber && (
        <Field
          type="checkbox"
          name={noPhoneCheckbox}
          register={register}
          label={t("label.applicantNoPhone")}
          disabled={additionalPhoneCheckboxValue}
          onChange={(e) => {
            if (e.target.checked) {
              setValue(phone, "")
              clearErrors(phone)
              setValue(phoneType, "")
              clearErrors(phoneType)
            }
          }}
        />
      )}
      {showAdditionalPhoneNumber && (
        <Field
          register={register}
          type="checkbox"
          name={additionalPhoneCheckbox}
          label={t("label.applicantAdditionalPhone")}
          disabled={noPhoneCheckboxValue}
          onChange={(e) => {
            if (!e.target.checked) {
              setValue(additionalPhone, "")
              clearErrors(additionalPhone)
              setValue(additionalPhoneType, "")
              clearErrors(additionalPhoneType)
            }
          }}
        />
      )}
      {additionalPhoneCheckboxValue && (
        <>
          <PhoneField
            name={additionalPhone}
            label={t(labelForAdditionalPhoneNumber)}
            control={control}
            controlClassName="control"
            required={additionalPhoneCheckboxValue}
            error={!!errors?.[additionalPhone]}
            errorMessage={t("error.phoneNumber")}
          />
          <Select
            fieldName={additionalPhoneType}
            label={t("label.whatTypeOfNumber")}
            options={[
              { name: t("label.phoneCell"), value: "cell" },
              { name: t("label.phoneHome"), value: "home" },
              { name: t("label.phoneWork"), value: "work" },
            ]}
            errorMessage={t("error.phoneNumberType")}
            validation={{
              required: additionalPhoneCheckboxValue,
            }}
          />
        </>
      )}
    </fieldset>
  )
}

export default Phone
