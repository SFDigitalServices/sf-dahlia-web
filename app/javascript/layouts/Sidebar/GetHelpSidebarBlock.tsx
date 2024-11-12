import { LinkButton, SidebarBlock, t } from "@bloom-housing/ui-components"
import React from "react"
import { getSfGovUrl, renderInlineMarkup } from "../../util/languageUtil"

const HousingCounselorHelp = () => (
  <p className="mb-4">{renderInlineMarkup(t("howToApplyPage.sidebar.getHelp.counselor"))}</p>
)

const GetHelpSidebarBlock = () => (
  <SidebarBlock
    className="w-full md:w-1/3 md:max-w-xs text-gray-950 md:border-l border-t md:border-t-0 border-gray-450 border-b-0 p-6 mx-0"
    title={t("listings.apply.needHelp")}
  >
    <HousingCounselorHelp />
    <LinkButton
      transition={true}
      newTab={true}
      href={getSfGovUrl(
        "https://www.sf.gov/resource/2022/homebuyer-program-counseling-agencies",
        7209
      )}
      className={"w-full"}
    >
      {t("housingCounselor.findAHousingCounselor")}
    </LinkButton>
  </SidebarBlock>
)

export default GetHelpSidebarBlock
