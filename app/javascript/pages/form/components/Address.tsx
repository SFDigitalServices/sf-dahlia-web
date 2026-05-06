/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field, Select } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { LISTING_APPLY_FORMS_INPUT_MAX_LENGTH, LATIN_REGEX } from "../../../modules/constants"
import { useFormContext } from "react-hook-form"
import { stateOptions } from "../../../util/formEngineUtil"
import styles from "./Address.module.scss"

interface AddressProps {
  label?: string
  note?: string
  showMailingAddress?: boolean
  showAptOrUnit?: boolean
  requireAddress?: boolean
  verifyAddress?: boolean
  fieldNames: {
    addressStreet: string
    addressAptOrUnit?: string
    addressCity: string
    addressState: string
    addressZipcode: string
    mailingAddressCheckbox?: string
    mailingAddressStreet?: string
    mailingAddressCity?: string
    mailingAddressState?: string
    mailingAddressZipcode?: string
  }
}

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
    mailingAddressCheckbox,
    mailingAddressStreet,
    mailingAddressCity,
    mailingAddressState,
    mailingAddressZipcode,
  },
}: AddressProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext()
  const mailingAddressCheckboxValue = mailingAddressCheckbox && watch(mailingAddressCheckbox, false)
  return (
    <fieldset>
      {label && <legend className="legend-header">{t(label)}</legend>}
      {note && <p className="field-note">{t(note)}</p>}
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
          validate: (value) => {
            if (value?.match(/P\.?\s*O\.?\s*BOX/i)) {
              return t("error.addressValidationPoBox")
            }
            const unitValue = watch(addressAptOrUnit || "")
            if (value && unitValue && value.endsWith(unitValue)) {
              return t("error.addressValidationDuplicateUnit")
            }
            return true
          },
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
          name={mailingAddressCheckbox}
          label={t("label.applicantSeparateAddress")}
          className="checkbox-field-label"
          register={register}
        />
      )}
      {mailingAddressCheckboxValue && (
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
