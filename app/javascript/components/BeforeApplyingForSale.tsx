import React from "react"
import { Heading, ListSection, t } from "@bloom-housing/ui-components"
import { getSfGovUrl, renderInlineMarkup, renderMarkup } from "../util/languageUtil"

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
        url: "http://www.habitatgsf.org/innes-ave",
      })}`
    )

    listItems = [
      {
        content: renderMarkup(
          `${t("listingsForSale.beforeApplyingHabitat.step1", {
            url: "http://www.habitatgsf.org/innes-ave",
          })}`
        ),
      },
      { content: t("listingsForSale.beforeApplyingHabitat.step2") },
      {
        content: renderMarkup(
          `${t("listingsForSale.beforeApplyingHabitat.step3", {
            url: "https://media.api.sf.gov/documents/DALP_Manual_-_2025.pdf",
          })}`
        ),
      },
      { content: t("listingsForSale.beforeApplyingHabitat.step4") },
    ]
  } else if (
    beforeApplyingType === BeforeApplyingType.DIRECTORY ||
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS
  ) {
    requirements = renderInlineMarkup(
      `${t("saleDirectory.beforeApplying.readFullList", {
        url: getSfGovUrl("https://sf.gov/determine-if-you-can-buy-affordable-housing-program"),
      })}`
    )
    listItems = [
      { content: t("saleDirectory.beforeApplying.step1") },
      {
        content: renderInlineMarkup(
          `${t("saleDirectory.beforeApplying.step2", {
            url: getSfGovUrl("https://sf.gov/determine-if-you-can-buy-affordable-housing-program"),
          })}`
        ),
      },
      {
        content: renderInlineMarkup(
          `${t("saleDirectory.beforeApplying.step3", {
            url: getSfGovUrl("https://sf.gov/sign-complete-homebuyer-education"),
          })}`
        ),
      },
      {
        content: renderInlineMarkup(
          `${t("saleDirectory.beforeApplying.step4", {
            url: getSfGovUrl(
              "https://sf.gov/reports/october-2023/find-lender-below-market-rate-program"
            ),
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
          <li className="text-gray-750 primary-lighter-markup-link" key={index}>
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
    <div className="mb-8">
      <Heading className="mb-5 text-gray-750" priority={2} styleType={"underlineWeighted"}>
        {t("saleDirectory.beforeApplying.title")}
      </Heading>
      <p className="text-gray-750">{t("saleDirectory.beforeApplying.makeSureYou")}</p>
      {content}
    </div>
  )
}
