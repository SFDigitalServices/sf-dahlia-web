import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { FormCard, Heading } from "@bloom-housing/ui-components"
import FormLayout from "../../layouts/FormLayout"

const ConfirmingEmail = () => {
  return (
    <FormLayout>
      {
        <FormCard header={<Heading priority={1}>The Canyon</Heading>}>
          <a href="http://localhost:3000/confirming_email">Go to building details</a>
        </FormCard>
      }
      {
        <FormCard header={<Heading priority={1}>Thank you for your response</Heading>}>
          <a href="http://localhost:3000/confirming_email">You answered yes</a>
        </FormCard>
      }
    </FormLayout>
  )
}

export default withAppSetup(ConfirmingEmail)
