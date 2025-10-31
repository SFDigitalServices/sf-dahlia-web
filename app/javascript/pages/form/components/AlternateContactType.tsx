import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import "./AlternateContactType.scss"

interface AlternateContactTypeProps {
  fieldNames: {
    alternateContactType: string
  }
}

const AlternateContactType = ({
  fieldNames: { alternateContactType },
}: AlternateContactTypeProps) => {
  const { register, errors, watch } = useFormStepContext()
  const selected = watch(alternateContactType)
  return (
    <fieldset>
      <Heading priority={2} size="sm">
        {t("label.alternateContact")}
      </Heading>
      <p className="field-note">{t("label.pleaseSelectOne")}</p>
      <div className="radio-field-group">
        <Field
          name={alternateContactType}
          type="radio"
          id="familyMember"
          label={t("label.familyMember")}
          register={register}
          inputProps={{
            value: "familyMember",
          }}
          validation={{ required: true }}
        />
        <Field
          name={alternateContactType}
          type="radio"
          id="friend"
          label={t("label.friend")}
          register={register}
          inputProps={{ value: "friend" }}
          validation={{ required: true }}
        />
        <Field
          name={alternateContactType}
          type="radio"
          id="socialWorkerOrHousingCounselor"
          label={t("label.socialWorkerOrHousingCounselor")}
          register={register}
          inputProps={{ value: "socialWorkerOrHousingCounselor" }}
          validation={{ required: true }}
        />
        <Field
          name={alternateContactType}
          type="radio"
          id="other"
          label={t("label.Other")}
          register={register}
          inputProps={{ value: "other" }}
          validation={{ required: true }}
        />
        {selected === "other" && (
          <Field
            name="alternateContactTypeOther"
            label={t("label.whatIsYourRelationship")}
            register={register}
            validation={{
              required: true,
            }}
            error={!!errors?.["alternateContactTypeOther"]}
            errorMessage={t("error.relationship")}
          />
        )}
        <Field
          name={alternateContactType}
          type="radio"
          id="noAlternateContact"
          label={t("label.noAlternateContact")}
          register={register}
          inputProps={{ value: "noAlternateContact" }}
          validation={{ required: true }}
        />
        {!!errors?.[alternateContactType] && (
          <FormErrorMessage>{t("error.alternateContact")}</FormErrorMessage>
        )}
      </div>
    </fieldset>
  )
}

export default AlternateContactType
