import React from "react"
import { Heading, ListSection, t } from "@bloom-housing/ui-components"
import { renderWithInnerHTML } from "../util/languageUtil"

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
    listClassNames.push("bg-white", "p-4", "pt-6", "text-sm")
  }

  // different requirements + list items for habitat vs other sales
  if (beforeApplyingType === BeforeApplyingType.LISTING_DETAILS_HABITAT) {
    requirements = renderWithInnerHTML(
      `${t("saleDirectory.beforeApplying.readFullList", {
        url: "https://habitatgsf.org/amber-drive-info/",
      })}`
    )

    listItems = [
      {
        content: renderWithInnerHTML(
          `${t("listings_for_sale.before_applying_habitat.step_1", {
            url: "https://habitatgsf.org/amber-drive-info/",
          })}`
        ),
      },
      { content: t("listings_for_sale.before_applying_habitat.step_2") },
      {
        content: renderWithInnerHTML(
          `${t("listings_for_sale.before_applying_habitat.step_3", {
            url:
              "https://sfmohcd.org/sites/default/files/Documents/MOH/Inclusionary%20Manuals/Inclusionary%20Affordable%20Housing%20Program%20Manual%2010.15.2018.pdf",
          })}`
        ),
      },
      { content: t("listings_for_sale.before_applying_habitat.step_4") },
    ]
  } else if (
    beforeApplyingType === BeforeApplyingType.DIRECTORY ||
    beforeApplyingType === BeforeApplyingType.LISTING_DETAILS
  ) {
    requirements = renderWithInnerHTML(
      `${t("saleDirectory.beforeApplying.readFullList", {
        url: "https://sfmohcd.org/homebuyer-program-eligibility",
      })}`
    )

    listItems = [
      { content: t("saleDirectory.beforeApplying.step1") },
      {
        content: renderWithInnerHTML(
          `${t("saleDirectory.beforeApplying.step2", {
            url: "https://sfmohcd.org/homebuyer-program-eligibility",
          })}`
        ),
      },
      {
        content: renderWithInnerHTML(
          `${t("saleDirectory.beforeApplying.step3", {
            url: "https://sfmohcd.org/homebuyer-application-requirements#education",
          })}`
        ),
      },
      {
        content: renderWithInnerHTML(
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
          <li key={index}>{item.content}</li>
        ))}
      </ol>
      {requirements}
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
      <Heading className="mb-5" priority={2} underline>
        {t("saleDirectory.beforeApplying.title")}
      </Heading>
      <p>{t("saleDirectory.beforeApplying.makeSureYou")}</p>
      {content}
    </div>
  )
}
