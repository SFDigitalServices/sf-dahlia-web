import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
// import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import "./ListingApplyFormWrapper.scss"

interface ListingApplyFormWrapperProps {
  currentStepIndex: number
  children: React.ReactNode
}

const ListingApplyFormWrapper = ({ children }: ListingApplyFormWrapperProps) => {
  const formEngineContext = useFormEngineContext()
  const { listing, currentStepIndex, stepInfoMap, sectionNames } = formEngineContext
  const currentStepChild = children[currentStepIndex]
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const showLayout = !currentStepInfo.hideLayout

  return (
    <section className="bg-gray-300">
      {showLayout ? (
        <div className="md:mb-20 md:mt-12 mx-auto max-w-xl print:my-0 print:max-w-full">
          <Card className="application-form-header">
            <Card.Section className="application-form-header-title">
              <Heading priority={1} className="application-form-header-heading">
                {t("pageTitle.listingApplication", { listing: listing.Name })}
              </Heading>
            </Card.Section>
            <Card.Section>
              <p>currentSection: {currentStepInfo.sectionName}</p>
              <p>sections: {JSON.stringify(sectionNames)}</p>
            </Card.Section>
          </Card>
          <Card>
            <Heading>debug current step slug: {JSON.stringify(currentStepInfo.slug)}</Heading>
          </Card>
          <Card>{currentStepChild}</Card>
        </div>
      ) : (
        <>{currentStepChild}</>
      )}
    </section>
  )
}

export default ListingApplyFormWrapper
