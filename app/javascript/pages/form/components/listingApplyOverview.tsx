import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"

interface ListingApplyOverviewProps {}

const ListingApplyOverview = ({}: ListingApplyOverviewProps) => {
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
        <h1 className="mt-6 mb-4 text-xl md:text-2xl">ListingApplyOverview Component</h1>
      </CardSection>
      <CardSection>
        <Button variant="primary" onClick={handleNextStep}>
          {t("t.next")}
        </Button>
      </CardSection>
    </>
  )
}

export default ListingApplyOverview
