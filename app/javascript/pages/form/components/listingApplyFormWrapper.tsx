import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import "./listingApplyFormWrapper.scss"

interface ListingApplyFormWrapperProps {
  currentStepIndex: number
  onNavigateNext: (todoSpecialNavBehavior: any) => void // TODO put into context?
  onNavigatePrev: (todoSpecialNavBehavior: any) => void
  // initialFormState:
  children: React.ReactNode
}

const ListingApplyFormWrapper = ({ children }: ListingApplyFormWrapperProps) => {
  const formEngineContext = useFormEngineContext()
  const { listingData, currentStepIndex, stepInfoMap, sectionNames } = formEngineContext
  const currentStepChild = children[currentStepIndex]
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const showLayout = !currentStepInfo.hideLayout

  console.log("children", children)

  return (
    <section className="bg-gray-300">
      <div className="md:mb-20 md:mt-12 mx-auto max-w-lg print:my-0 print:max-w-full">
        {showLayout ? (
          <>
            <Card className="application-form-header ">
              <CardSection className="application-form-header-title">
                <Heading priority={1} className="application-form-header-heading">
                  {t("pageTitle.listingApplication", { listing: listingData.Name })}
                </Heading>
              </CardSection>
              <CardSection>
                <p>currentSection: {currentStepInfo.sectionName}</p>
                <p>sections: {JSON.stringify(sectionNames)}</p>
              </CardSection>
            </Card>
            <Card>{currentStepChild}</Card>
          </>
        ) : (
          <>{currentStepChild}</>
        )}
      </div>
    </section>
  )
}

export default ListingApplyFormWrapper
