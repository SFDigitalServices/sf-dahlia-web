import React from "react"
import { t, Field, Select } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"

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
  const { register, errors, setValue, clearErrors } = useFormStepContext()
  const [noPhoneCheckbox, setNoPhoneCheckbox] = React.useState(false)
  const [noAdditionalPhoneCheckbox, setNoAdditionalPhoneCheckbox] = React.useState(false)
  return (
    <fieldset>
      <Field
        name={phone}
        label={t(label)}
        register={register}
        disabled={noPhoneCheckbox}
        validation={{
          required: !noPhoneCheckbox,
        }}
        error={!!errors?.[phone]}
        errorMessage={t("error.phoneNumber")}
      />
      {showTypeOfNumber && (
        <Select
          name={phoneType}
          label={t("label.whatTypeOfNumber")}
          options={[
            { label: t("label.phoneHome"), value: "home" },
            { label: t("label.phoneWork"), value: "work" },
            { label: t("label.phoneCell"), value: "cell" },
          ]}
          register={register}
          disabled={noPhoneCheckbox}
          controlClassName="control"
          error={!!errors?.[phoneType]}
          errorMessage={t("error.phoneNumberType")}
          validation={{
            required: !noPhoneCheckbox,
          }}
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
          errorMessage={t("error.phoneNumberType")}
          validation={{
            required: true,
          }}
          onChange={(e) => {
            const isChecked = e.target.checked
            setNoAdditionalPhoneCheckbox(isChecked)
            setValue("noPhone", false)
            setNoPhoneCheckbox(false)
          }}
        />
      )}
      {noAdditionalPhoneCheckbox && (
        <Field
          name={additionalPhone}
          label={t(labelForAdditionalPhoneNumber)}
          register={register}
          validation={{
            required: true,
          }}
          error={!!errors?.[additionalPhone]}
          errorMessage={t("error.phoneNumber")}
        />
      )}
      {noAdditionalPhoneCheckbox && (
        <Select
          name={additionalPhoneType}
          label={t("label.whatTypeOfNumber")}
          options={[
            { label: t("label.phoneHome"), value: "home" },
            { label: t("label.phoneWork"), value: "work" },
            { label: t("label.phoneCell"), value: "cell" },
          ]}
          register={register}
          controlClassName="control"
          error={!!errors?.[additionalPhoneType]}
          errorMessage={t("error.phoneNumberType")}
          validation={{
            required: true,
          }}
        />
      )}
    </fieldset>
  )
}

export default Phone
