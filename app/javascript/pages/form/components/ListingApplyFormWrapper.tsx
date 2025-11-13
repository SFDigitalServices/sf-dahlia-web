import React from "react"
import { ProgressNav, t } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
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
  const currentSectionIndex = sectionNames.indexOf(currentStepInfo.sectionName)
  const showLayout = !currentStepInfo.hideLayout

  return (
    <section className="listing-apply-form-section">
      {showLayout ? (
        <div className="listing-apply-form-container">
          <Card className="listing-apply-form-header">
            <Card.Section className="listing-apply-form-header-title">
              <Heading priority={1} className="listing-apply-form-header-heading">
                {t("pageTitle.listingApplication", { listing: listing.Name })}
              </Heading>
            </Card.Section>
            <Card.Section className="listing-apply-form-nav">
              <ProgressNav
                labels={sectionNames}
                currentPageSection={currentSectionIndex + 1}
                completedSections={currentSectionIndex}
                mounted={true}
                removeSrHeader
              />
            </Card.Section>
          </Card>
          <Card className="listing-apply-form-content-container">{currentStepChild}</Card>
        </div>
      ) : (
        <div className="listing-apply-form-minimal-container">{currentStepChild}</div>
      )}
    </section>
  )
}

export default ListingApplyFormWrapper
