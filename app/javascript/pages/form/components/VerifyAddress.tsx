import React, { useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./VerifyAddress.module.scss"
import { getAddressErrorMessage, locateVerifiedAddress } from "../../../api/formApiService"

interface VerifyAddressProps {
  address?: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }
  setAddressError: (error: string) => void
  setAddress: (address: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }) => void
  setLoading: (loading: boolean) => void
}

const VerifyAddress = ({
  address,
  setAddressError,
  setAddress,
  setLoading,
}: VerifyAddressProps) => {
  const { saveFormData, handleNextStep, handlePrevStep } = useFormEngineContext()
  const formMethods = useForm({
    mode: "onChange",
    shouldFocusError: false,
  })
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = formMethods

  useEffect(() => {
    void (async () => {
      console.log("address", address)
      try {
        setLoading(true)
        setAddressError(null)
        const response = await locateVerifiedAddress(address)
        if (response.address && !response.address.invalid) {
          setAddress({
            street1: response.address.street1,
            street2: response.address.street2,
            city: response.address.city,
            state: response.address.state,
            zip: response.address.zip,
          })
        } else if (response.address?.invalid || response.error) {
          setAddressError(getAddressErrorMessage(response.address?.error || response.error))
        }
      } catch (error) {
        setAddressError(getAddressErrorMessage((error as Error)?.message))
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = () => {
    saveFormData({
      primaryApplicantAddressStreet: address.street1,
      primaryApplicantAddressAptOrUnit: address.street2,
      primaryApplicantAddressCity: address.city,
      primaryApplicantAddressState: address.state,
      primaryApplicantAddressZipcode: address.zip,
    })
    handleNextStep()
  }
  const formattedAddress = getFormattedAddress(address)
  return (
    <FormProvider {...formMethods}>
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
              name="address"
              register={register}
              validation={{
                required: t("error.address"),
              }}
              error={!!errors?.["address"]}
              errorMessage={errors?.["address"]?.message}
              inputProps={{ value: "address" }}
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
    </FormProvider>
  )
}

export default VerifyAddress
