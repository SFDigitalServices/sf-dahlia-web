import React from "react"
import { t, Field, Select } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { LISTING_APPLY_FORMS_INPUT_MAX_LENGTH, LATIN_REGEX } from "../../../modules/constants"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import styles from "./Address.module.scss"

interface AddressProps {
  label?: string
  note?: string
  showMailingAddress?: boolean
  showAptOrUnit?: boolean
  requireAddress?: boolean
  fieldNames: {
    addressStreet: string
    addressAptOrUnit?: string
    addressCity: string
    addressState: string
    addressZipcode: string
    mailingAddressStreet?: string
    mailingAddressCity?: string
    mailingAddressState?: string
    mailingAddressZipcode?: string
  }
}

const stateOptions = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District Of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

const Address = ({
  label,
  note,
  showMailingAddress,
  showAptOrUnit,
  requireAddress,
  fieldNames: {
    addressStreet,
    addressAptOrUnit,
    addressCity,
    addressState,
    addressZipcode,
    mailingAddressStreet,
    mailingAddressCity,
    mailingAddressState,
    mailingAddressZipcode,
  },
}: AddressProps) => {
  const { register, errors } = useFormStepContext()
  const [mailingAddressChecked, setMailingAddressChecked] = React.useState(false)
  return (
    <fieldset>
      <Heading priority={2} size="sm">
        {t(label)}
      </Heading>
      <p className="field-note">{t(note)}</p>
      <Field
        name={addressStreet}
        label={t("label.address1")}
        validation={{
          required: requireAddress,
          pattern: {
            value: LATIN_REGEX,
            message: t("error.pleaseProvideAnswersInEnglish"),
          },
          maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address,
        }}
        errorMessage={
          errors?.[addressStreet]?.type === "required"
            ? t("error.address")
            : errors?.[addressStreet]?.message
        }
        error={!!errors?.[addressStreet]}
        register={register}
      />
      {showAptOrUnit && (
        <Field
          name={addressAptOrUnit}
          label={t("label.address2")}
          register={register}
          validation={{ maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address }}
        />
      )}
      <div className={styles["address-field-group"]}>
        <Field
          name={addressCity}
          label={t("label.city")}
          validation={{
            required: requireAddress,
            pattern: {
              value: LATIN_REGEX,
              message: t("error.pleaseProvideAnswersInEnglish"),
            },
            maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.city,
          }}
          errorMessage={
            errors?.[addressCity]?.type === "required"
              ? t("error.city")
              : errors?.[addressCity]?.message
          }
          error={!!errors?.[addressCity]}
          register={register}
        />
        <Select
          name={addressState}
          label={t("label.state")}
          validation={{
            required: requireAddress,
            maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address,
          }}
          error={!!errors?.[addressState]}
          errorMessage={t("error.state")}
          register={register}
          controlClassName="control"
          options={stateOptions}
          placeholder={t("label.selectOne")}
        />
      </div>
      <Field
        name={addressZipcode}
        label={t("label.zip")}
        validation={{
          required: requireAddress,
          maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.zipcode,
          pattern: {
            value: /^\d{5}(-\d{4})?$/,
            message: t("error.zip"),
          },
        }}
        errorMessage={t("error.zip")}
        error={!!errors?.[addressZipcode]}
        register={register}
      />
      {showMailingAddress && (
        <Field
          type="checkbox"
          name="mailingAddressCheckbox"
          label={t("label.applicantSeparateAddress")}
          onChange={(e) => setMailingAddressChecked(e.target.checked)}
        />
      )}
      {mailingAddressChecked && (
        <>
          <Heading priority={2} size="sm">
            {t("label.mailingAddress")}
          </Heading>
          <p className="field-note">{t("b2Contact.provideAnAddress")}</p>
          <Field
            name={mailingAddressStreet}
            label={t("label.address1")}
            validation={{
              required: requireAddress,
              pattern: {
                value: LATIN_REGEX,
                message: t("error.pleaseProvideAnswersInEnglish"),
              },
              maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address,
            }}
            errorMessage={
              errors?.[mailingAddressStreet]?.type === "required"
                ? t("error.address")
                : errors?.[mailingAddressStreet]?.message
            }
            error={!!errors?.[mailingAddressStreet]}
            register={register}
          />
          <div className={styles["address-field-group"]}>
            <Field
              name={mailingAddressCity}
              label={t("label.city")}
              validation={{
                required: requireAddress,
                pattern: {
                  value: LATIN_REGEX,
                  message: t("error.pleaseProvideAnswersInEnglish"),
                },
                maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.city,
              }}
              errorMessage={
                errors?.[mailingAddressCity]?.type === "required"
                  ? t("error.city")
                  : errors?.[mailingAddressCity]?.message
              }
              error={!!errors?.[mailingAddressCity]}
              register={register}
            />
            <Select
              name={mailingAddressState}
              label={t("label.state")}
              validation={{
                required: requireAddress,
                maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address,
              }}
              error={!!errors?.[mailingAddressState]}
              errorMessage={t("error.state")}
              register={register}
              controlClassName="control"
              options={stateOptions}
              placeholder={t("label.selectOne")}
            />
          </div>
          <Field
            name={mailingAddressZipcode}
            label={t("label.zip")}
            validation={{
              required: requireAddress,
              maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.zipcode,
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: t("error.zip"),
              },
            }}
            errorMessage={t("error.zip")}
            error={!!errors?.[mailingAddressZipcode]}
            register={register}
          />
        </>
      )}
    </fieldset>
  )
}

export default Address
