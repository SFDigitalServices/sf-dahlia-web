import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"

const AddHouseholdMembers = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, handlePrevStep } = formEngineContext

  return (
    <>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <Heading>AddHouseholdMembers Component</Heading>
      </CardSection>
      <CardSection>
        <Button variant="primary" onClick={handleNextStep}>
          {t("t.next")}
        </Button>
      </CardSection>
    </>
  )
}

export default AddHouseholdMembers
