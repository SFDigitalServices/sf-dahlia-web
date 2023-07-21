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
      <div className="flex flex-col mr-8 ml-8 mb-8">
        {additionalResources.categories.map((category) => {
          return (
            <div className="info-card-grid-additional-resources">
              <InfoCardGrid
                title={t(category.title)}
                subtitle={t(category.subtitle)}
                defaultHeadingStyle
              >
                {category.resources.map((resource) => {
                  return (
                    <InfoCard
                      title={t(resource.title)}
                      subtitle={t(resource.agency)}
                      externalHref={resource.externalUrl}
                      className="info-card-additional-resources is-normal-primary-lighter"
                      key={resource.title}
                    >
                      {<div className="text-gray-950 text-xs">{t(resource.description)}</div>}
                    </InfoCard>
                  )
                })}
              </InfoCardGrid>
            </div>
          )
        })}
      </div>
    </AssistanceLayout>
  )
}

export default withAppSetup(AdditionalResources)
