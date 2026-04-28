import React from "react"
import { Field, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./VerifyAddress.module.scss"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"

interface VerifyAddressProps {
  onEdit: () => void
}

const VerifyAddress = ({ onEdit }: VerifyAddressProps) => {
  const { handleNextStep, formData } = useFormEngineContext()
  const formattedAddress = getFormattedAddress({
    street1: formData.primaryApplicantAddressStreet as string,
    street2: formData.primaryApplicantAddressAptOrUnit as string,
    city: formData.primaryApplicantAddressCity as string,
    state: formData.primaryApplicantAddressState as string,
    zip: formData.primaryApplicantAddressZipcode as string,
  })
  return (
    <Card>
      <Card.Header divider="inset">
        <Heading className={`${stepStyles["step-title"]} ${stepStyles["no-back"]}`}>
          {t("b2aVerifyAddress.title")}
        </Heading>
      </Card.Header>
      <CardSection className={styles.addressSection}>
        <Field
          type="radio"
          name="address"
          validation={{
            required: t("error.address"),
          }}
          inputProps={{ value: "address" }}
          label={
            <>
              {formattedAddress.streets}
              <br />
              {formattedAddress.cityStateZip}
            </>
          }
        />
        <Button type="button" variant="text" onClick={onEdit}>
          {t("t.edit")}
        </Button>
      </CardSection>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button variant="primary" onClick={() => handleNextStep()}>
          {t("t.next")}
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default VerifyAddress
