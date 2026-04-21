import React, { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, Field, t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { locateVerifiedAddress } from "../../../api/formApiService"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./VerifyAddress.module.scss"

interface VerifyAddressProps {
  address: string
}

const VerifyAddress = ({ address }: VerifyAddressProps) => {
  const { formData, saveFormData, handleNextStep, handlePrevStep } = useFormEngineContext()
  const formMethods = useForm({
    mode: "onChange",
    shouldFocusError: false,
  })
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, clearErrors } = formMethods
  const [validatedAddress, setValidatedAddress] = useState(null)
  const onSubmit = () => {
    const updatedFormData = {
      [`${address}Street`]: validatedAddress.street1,
      [`${address}AptOrUnit`]: validatedAddress.street2,
      [`${address}City`]: validatedAddress.city,
      [`${address}State`]: validatedAddress.state,
      [`${address}Zipcode`]: validatedAddress.zip,
    }
    saveFormData(updatedFormData)
    handleNextStep()
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await locateVerifiedAddress({
          street1: formData[`${address}Street`] as string,
          street2: formData[`${address}AptOrUnit`] as string,
          city: formData[`${address}City`] as string,
          state: formData[`${address}State`] as string,
          zip: formData[`${address}Zipcode`] as string,
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
        handlePrevStep()
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
      <LoadingOverlay isLoading={!validatedAddress}>
        <Card>
          <Card.Header divider="inset">
            <Heading className={`${stepStyles["step-title"]} ${stepStyles["no-back"]}`}>
              {t("b2aVerifyAddress.title")}
            </Heading>
          </Card.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <CardSection className={styles.addressSection}>
              <Field
                type="radio"
                name={address}
                register={register}
                validation={{
                  required: t("error.confirmedAddress"),
                }}
                error={!!errors?.[address]}
                onChange={() => clearErrors(address)}
                errorMessage={errors?.[address]?.message}
                inputProps={{ value: address }}
                label={
                  <>
                    {formattedAddress.streets}
                    <br />
                    {formattedAddress.cityStateZip}
                  </>
                }
              />
              <Button type="button" variant="text" onClick={handlePrevStep}>
                {t("t.edit")}
              </Button>
            </CardSection>
            <Card.Footer className={stepStyles["step-footer"]}>
              <Button variant="primary" type="submit">
                {t("t.next")}
              </Button>
            </Card.Footer>
          </Form>
        </Card>
      </LoadingOverlay>
    </FormProvider>
  )
}

export default VerifyAddress
