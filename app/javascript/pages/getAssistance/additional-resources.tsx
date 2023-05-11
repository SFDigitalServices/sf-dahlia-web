import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import additionalResources from "./additional-resources.json"
import { InfoCard, InfoCardGrid, t } from "@bloom-housing/ui-components"
import "./additional-resources.scss"

const AdditionalResources = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.additionalHousingOpportunities")}
      subtitle={t("assistance.subtitle.additionalHousingOpportunities")}
    >
      <div className="flex flex-col mr-8">
        <div className="info-card-grid-additional-resources">
          <InfoCardGrid
            title="San Fransciso Housing Programs"
            subtitle="Programs run and funded by the City and County of San Francisco"
            headingStyle="default"
          >
            {additionalResources.sanFranciscoHousingPrograms.map((resource) => {
              return (
                <InfoCard
                  title={resource.title}
                  subtitle={resource.agency}
                  externalHref={resource.externalUrl}
                  className="info-card-additional-resources is-normal-primary-lighter"
                  key={resource.title}
                >
                  {<div className="text-gray-950 text-xs">{resource.description}</div>}
                </InfoCard>
              )
            })}
          </InfoCardGrid>
        </div>

        <InfoCardGrid
          title="Non-MOHCD housing programs and resources"
          subtitle="These are resources from other cities and nonprofits. They are not sponsored by the city of San Francisco. We are not able to answer any questions about these resources. Please contact the organizations listed if you have any questions."
          headingStyle="default"
        >
          {additionalResources.nonMOHCDHousingPrograms.map((resource) => {
            return (
              <InfoCard
                title={resource.title}
                subtitle={resource.agency}
                externalHref={resource.externalUrl}
                className="info-card-additional-resources is-normal-primary-lighter"
                key={resource.title}
              >
                {<div className="text-gray-950 text-xs">{resource.description}</div>}
              </InfoCard>
            )
          })}
        </InfoCardGrid>
      </div>
    </AssistanceLayout>
  )
}

export default withAppSetup(AdditionalResources)
