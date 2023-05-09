import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { InfoCard, t } from "@bloom-housing/ui-components"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import InfoCardGridAdditionalResources from "./InfoCardGridAdditionalResources"
import additionalResources from "./additional-resources.json"

const AdditionalResources = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.additionalHousingOpportunities")}
      subtitle={t("assistance.subtitle.additionalHousingOpportunities")}
    >
      <div className="flex flex-col mr-8">
        {/* <h1>{t("assistance.title.additionalHousingOpportunities")}</h1> */}
        <InfoCardGridAdditionalResources
          title="San Fransciso Housing Programs"
          subtitle="Programs run and funded by the City and County of San Francisco"
          className="mb-4"
        >
          {additionalResources.sanFranciscoHousingPrograms.map((resource) => {
            return (
              <InfoCard
                title={resource.title}
                subtitle={resource.agency}
                externalHref={resource.externalUrl}
                className="is-normal-primary-lighter"
                key={resource.title}
              >
                {<div className="text-gray-700 text-xs">{resource.description}</div>}
              </InfoCard>
            )
          })}
        </InfoCardGridAdditionalResources>

        <InfoCardGridAdditionalResources
          title="Non-MOHCD housing programs and resources"
          subtitle="These are resources from other cities and nonprofits. They are not sponsored by the city of San Francisco. We are not able to answer any questions about these resources. Please contact the organizations listed if you have any questions."
          className="mb-4"
        >
          {additionalResources.nonMOHCDHousingPrograms.map((resource) => {
            return (
              <InfoCard
                title={resource.title}
                subtitle={resource.agency}
                externalHref={resource.externalUrl}
                className="is-normal-primary-lighter"
                key={resource.title}
              >
                {<div className="text-gray-700 text-xs translate">{resource.description}</div>}
              </InfoCard>
            )
          })}
        </InfoCardGridAdditionalResources>
      </div>
    </AssistanceLayout>
  )
}

export default withAppSetup(AdditionalResources)
