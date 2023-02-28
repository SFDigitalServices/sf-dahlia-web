import React from "react"
import { Heading, ListSection, t } from "@bloom-housing/ui-components"
import { renderMarkup } from "../util/languageUtil"

export enum BeforeApplyingType {
  DIRECTORY,
  LISTING_DETAILS,
  LISTING_DETAILS_HABITAT,
}
export interface BeforeApplyingForSaleProps {
  /**
   * Header will display differently depending on type
   */
  beforeApplyingType: BeforeApplyingType
}
export const BeforeApplyingForSale = ({ beforeApplyingType }: BeforeApplyingForSaleProps) => {
  const listClassNames = ["numbered-list", "my-5"]
  let listItems, requirements

  // extra styles on the details page
  if (
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS ||
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS_HABITAT
  ) {
    listClassNames.push("bg-white", "p-4", "pt-6", "text-xs")
  }

  // different requirements + list items for habitat vs other sales
  if (beforeApplyingType === BeforeApplyingType.LISTING_DETAILS_HABITAT) {
    requirements = renderMarkup(
      `${t("saleDirectory.beforeApplying.readFullList", {
        url: "https://habitatgsf.org/amber-drive-info/",
      })}`
    )

    listItems = [
      {
        content: renderMarkup(
          `${t("listingsForSale.beforeApplyingHabitat.step1", {
            url: "https://habitatgsf.org/amber-drive-info/",
          })}`
        ),
      },
      { content: t("listingsForSale.beforeApplyingHabitat.step2") },
      {
        content: renderMarkup(
          `${t("listingsForSale.beforeApplyingHabitat.step3", {
            url:
              "https://sfmohcd.org/sites/default/files/Documents/MOH/Inclusionary%20Manuals/Inclusionary%20Affordable%20Housing%20Program%20Manual%2010.15.2018.pdf",
          })}`
        ),
      },
      { content: t("listingsForSale.beforeApplyingHabitat.step4") },
    ]
  } else if (
    beforeApplyingType === BeforeApplyingType.DIRECTORY ||
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS
  ) {
    requirements = renderMarkup(
      `${t("saleDirectory.beforeApplying.readFullList", {
        url: "https://sfmohcd.org/homebuyer-program-eligibility",
      })}`
    )

    listItems = [
      { content: t("saleDirectory.beforeApplying.step1") },
      {
        content: renderMarkup(
          `${t("saleDirectory.beforeApplying.step2", {
            url: "https://sfmohcd.org/homebuyer-program-eligibility",
          })}`
        ),
      },
      {
        content: renderMarkup(
          `${t("saleDirectory.beforeApplying.step3", {
            url: "https://sfmohcd.org/homebuyer-application-requirements#education",
          })}`
        ),
      },
      {
        content: renderMarkup(
          `${t("saleDirectory.beforeApplying.step4", {
            url: "https://sfmohcd.org/lender-list",
          })}`
        ),
      },
      { content: t("saleDirectory.beforeApplying.step5") },
    ]
  }

  // similar format for list items, but they will be wrapped differently depending on if directory page or details page
  const content = (
    <>
      <ol className={[...listClassNames].join(" ")}>
        {listItems.map((item, index) => (
          <li className="text-gray-700" key={index}>
            {item.content}
          </li>
        ))}
      </ol>
      <div className="text-gray-750 primary-lighter-markup-link-desktop">{requirements}</div>
    </>
  )

  return beforeApplyingType === BeforeApplyingType.LISTING_DETAILS ||
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS_HABITAT ? (
    <ListSection
      title={t("saleDirectory.beforeApplying.title")}
      subtitle={t("saleDirectory.beforeApplying.makeSureYou")}
    >
      {content}
    </ListSection>
  ) : (
    <li className="mb-8 style-none">
      <Heading className="mb-5 text-gray-750" priority={2} styleType={"underlineWeighted"}>
        {t("saleDirectory.beforeApplying.title")}
      </Heading>
      <p className="text-gray-750">{t("saleDirectory.beforeApplying.makeSureYou")}</p>
      {content}
    </li>
  )
}
