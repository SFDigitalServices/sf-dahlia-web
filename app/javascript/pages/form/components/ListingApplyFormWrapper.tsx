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
  const { listing, currentStepIndex, stepInfoMap } = formEngineContext
  const currentStepChild = children[currentStepIndex]
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const showLayout = !currentStepInfo.hideLayout

  return (
    <section className="bg-gray-300">
      <div className="md:mb-20 md:mt-12 mx-auto max-w-lg print:my-0 print:max-w-full">
        {showLayout ? (
          <>
            <Card className="application-form-header">
              <Card.Section className="application-form-header-title">
                <Heading priority={1} className="application-form-header-heading">
                  {t("pageTitle.listingApplication", { listing: listing.Name })}
                </Heading>
              </Card.Section>
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
