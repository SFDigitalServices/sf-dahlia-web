import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import AssistanceLayout from "../../layouts/HeaderSidebarLayout"
import additionalResources from "../../../assets/json/additional-resources.json"
import { InfoCard, InfoCardGrid, t } from "@bloom-housing/ui-components"
import "./additional-resources.scss"
import { getSfGovUrl } from "../../util/languageUtil"

const AdditionalResources = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.additionalHousingOpportunities")}
      subtitle={t("assistance.subtitle.additionalHousingOpportunities")}
    >
      <div className="flex flex-col ml-8 mr-8 mb-8 mt-8 lg:ml-0">
        {additionalResources.categories.map((category) => {
          return (
            <div className="info-card-grid-additional-resources mb-0 md:mb-8" key={category.title}>
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
                      externalHref={getSfGovUrl(resource.externalUrl)}
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
