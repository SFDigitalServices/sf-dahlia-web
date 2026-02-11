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
  }
}

const Phone = ({
  label,
  showTypeOfNumber,
  showDontHavePhoneNumber,
  showAdditionalPhoneNumber,
  labelForAdditionalPhoneNumber,
  fieldNames: { phone, additionalPhone, phoneType, additionalPhoneType },
}: PhoneProps) => {
  const {
    control,
    formState: { errors },
    setValue,
    clearErrors,
  } = useFormContext()
  const [noPhoneCheckbox, setNoPhoneCheckbox] = React.useState(false)
  const [noAdditionalPhoneCheckbox, setNoAdditionalPhoneCheckbox] = React.useState(false)
  return (
    <fieldset>
      <PhoneField
        name={phone}
        label={t(label)}
        control={control}
        disabled={noPhoneCheckbox}
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
          disabled={noPhoneCheckbox}
          errorMessage={t("error.phoneNumberType")}
        />
      )}
      {showDontHavePhoneNumber && (
        <Field
          type="checkbox"
          name={"noPhone"}
          label={t("label.applicantNoPhone")}
          error={!!errors?.["noPhone"]}
          errorMessage={t("error.phoneNumberType")}
          disabled={noAdditionalPhoneCheckbox}
          validation={{
            required: true,
          }}
          onChange={(e) => {
            const isChecked = e.target.checked
            setNoPhoneCheckbox(isChecked)
            if (isChecked) {
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
          type="checkbox"
          name={"additionalPhone"}
          label={t("label.applicantAdditionalPhone")}
          error={!!errors?.["additionalPhone"]}
          disabled={noPhoneCheckbox}
          errorMessage={t("error.phoneNumberType")}
          validation={{
            required: true,
          }}
          onChange={(e) => {
            const isChecked = e.target.checked
            setNoAdditionalPhoneCheckbox(isChecked)
          }}
        />
      )}
      {noAdditionalPhoneCheckbox && (
        <>
          <PhoneField
            name={additionalPhone}
            label={t(labelForAdditionalPhoneNumber)}
            control={control}
            controlClassName="control"
            required={true}
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
          />
        </>
      )}
    </fieldset>
  )
}

export default Phone
