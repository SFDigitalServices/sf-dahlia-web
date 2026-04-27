// https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357

import React, { Children, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, LoadingOverlay, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"
import getFormComponentRegistry from "../../../formEngine/formComponentRegistry"
import VerifyAddress from "./VerifyAddress"

interface ListingAddressMultiStepWrapperProps {
  title: string
  titleVars?: Record<string, DataSchema>
  headerComponentName?: string
  description?: string
  children: React.ReactNode
}

const ListingAddressMultiStepWrapper = ({
  title,
  titleVars,
  headerComponentName,
  description,
  children,
}: ListingAddressMultiStepWrapperProps) => {
  const [addressError, setAddressError] = useState(null)
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifyAddress, setVerifyAddress] = useState(false)
  const formEngineContext = useFormEngineContext()
  const { staticData, formData, stepInfoMap, currentStepIndex, handlePrevStep } = formEngineContext

  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  let headerComponent
  if (headerComponentName) {
    const componentRegistry = getFormComponentRegistry()
    headerComponent = React.createElement(componentRegistry[headerComponentName])
  }

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = () => {
    setVerifyAddress(true)
  }

  const titleString = translationFromDataSchema(title, titleVars, staticData, formData)

  return verifyAddress ? (
    <VerifyAddress
      address={address}
      setAddressError={setAddressError}
      setAddress={setAddress}
      setLoading={setLoading}
    />
  ) : (
    <FormProvider {...methods}>
      <LoadingOverlay isLoading={loading}>
        <Card>
          <Card.Section>
            <Button variant="text" className={styles["back-button"]} onClick={handlePrevStep}>
              {t("t.back")}
            </Button>
          </Card.Section>
          {headerComponent ? (
            <>{headerComponent}</>
          ) : (
            <Card.Header divider="inset">
              <h1 className={styles["step-title"]}>{titleString}</h1>
              {description && <p className={styles["step-description"]}>{t(description)}</p>}
            </Card.Header>
          )}
          <Form onSubmit={methods.handleSubmit(onSubmit)}>
            {Children.map(children, (child) => {
              const { schema } = (child as React.ReactElement).props
              return (
                <Card.Section divider={schema?.props?.divider === false ? undefined : "inset"}>
                  {/* Pass address validation error as prop if address component */}
                  {schema?.componentName === "Address" && addressError
                    ? React.cloneElement(child as React.ReactElement, { addressError })
                    : child}
                </Card.Section>
              )
            })}
            <Card.Footer className={styles["step-footer"]}>
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

export default ListingAddressMultiStepWrapper
