import React, { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { locateVerifiedAddress } from "../../../api/formApiService"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./VerifyAddress.module.scss"

interface VerifyAddressProps {
  fieldNames: {
    verifiedAddress: string
  }
}

const VerifyAddress = ({ fieldNames: { verifiedAddress } }: VerifyAddressProps) => {
  const { formData, saveFormData, handleNextStep, handlePrevStep } = useFormEngineContext()
  const formMethods = useForm({
    mode: "onChange",
    shouldFocusError: false,
  })
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = formMethods
  const [validatedAddress, setValidatedAddress] = useState(null)
  const onSubmit = (data: Record<string, unknown>) => {
    const updatedFormData = {
      primaryApplicantAddressStreet: validatedAddress.street1,
      primaryApplicantAddressAptOrUnit: validatedAddress.street2,
      primaryApplicantAddressCity: validatedAddress.city,
      primaryApplicantAddressState: validatedAddress.state,
      primaryApplicantAddressZipcode: validatedAddress.zip,
    }
    saveFormData({ ...data, ...updatedFormData })
    handleNextStep()
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await locateVerifiedAddress({
          street1: formData.primaryApplicantAddressStreet as string,
          street2: formData.primaryApplicantAddressAptOrUnit as string,
          city: formData.primaryApplicantAddressCity as string,
          state: formData.primaryApplicantAddressState as string,
          zip: formData.primaryApplicantAddressZipcode as string,
        })
        if (response.address && !response.address.invalid) {
          setValidatedAddress({
            street1: response.address.street1,
            street2: response.address.street2,
            city: response.address.city,
            state: response.address.state,
            zip: response.address.zip,
          })
        }
      } catch {
        alert(t("error.alert.badRequest"))
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formattedAddress = getFormattedAddress({
    street1: validatedAddress?.street1,
    street2: validatedAddress?.street2,
    city: validatedAddress?.city,
    state: validatedAddress?.state,
    zip: validatedAddress?.zip,
  })
  return (
    <FormProvider {...formMethods}>
      <Card>
        <Card.Header divider="inset">
          <Heading className={`${stepStyles["step-title"]} ${stepStyles["no-back"]}`}>
            {t("b2aVerifyAddress.title")}
          </Heading>
        </Card.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <CardSection>
            <div className={styles.addressSection}>
              <div>
                <Field
                  type="radio"
                  name={verifiedAddress}
                  register={register}
                  validation={{
                    required: true,
                  }}
                  className={styles.addressRadio}
                  error={!!errors?.[verifiedAddress]}
                  errorMessage={t("error.confirmedAddress")}
                />
              </div>
              <div className={styles.addressContent}>
                {formattedAddress.streets}
                <br />
                {formattedAddress.cityStateZip}
                <Button type="button" variant="text" onClick={handlePrevStep}>
                  {t("t.edit")}
                </Button>
              </div>
            </div>
          </CardSection>
          <Card.Footer className={stepStyles["step-footer"]}>
            <Button variant="primary" type="submit">
              {t("t.next")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default VerifyAddress
