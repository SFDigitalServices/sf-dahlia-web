import { SidebarBlock, t } from "@bloom-housing/ui-components"
import React from "react"
import { renderInlineMarkup, getSfGovUrl } from "../../util/languageUtil"

const SidebarContactInfo = () => (
  <div>
    <span className="font-semibold">{t("assistance.contact.questionsAboutPrograms.title1")}</span>
    <br />
    <div>
      {renderInlineMarkup(
        t("assistance.contact.questionsAboutPrograms.contactWebsite", {
          url: getSfGovUrl(
            "https://sf.gov/departments/mayors-office-housing-and-community-development",
            55
          ),
        })
      )}
    </div>
    <div className="mt-1">
      {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactEmail"))}
    </div>
    <div className="mt-1">
      {t("assistance.contact.questionsAboutPrograms.contactCall.title")}
      <ul className="list-disc list-inside mt-1">
        <li>
          English: <a href="tel:+14157015622">(415) 701-5622</a>
        </li>
        <li>
          Español: <a href="tel:+14157015624">(415) 701-5624</a>
        </li>
        <li>
          中文: <a href="tel:+14157015623">(415) 701-5623</a>
        </li>
        <li>
          Filipino: <a href="tel:+14157015570">(415) 701-5570</a>
        </li>
      </ul>
    </div>
  </div>
)

const SidebarSFHelp = () => (
  <p className="mb-4">
    <span className="font-semibold">{t("assistance.contact.helpLine.title1")}</span>
    <br />
    {renderInlineMarkup(
      t("assistance.contact.helpLine.subtitle", {
        url: getSfGovUrl("https://sf.gov/departments/311-customer-service-center", 217),
      })
    )}
  </p>
)

const SidebarListingQuestion = () => (
  <p className="mb-4">
    <span className="font-semibold">{t("assistance.contact.questionsAboutListings.title1")}</span>
    <br /> {renderInlineMarkup(t("assistance.contact.questionsAboutListings.subtitle"))}
  </p>
)

const ContactSideBarBlock = () => (
  <SidebarBlock
    className="w-full md:w-1/3 md:max-w-xs text-gray-950 md:border-l border-t md:border-t-0 border-gray-450 border-b-0 p-6 mx-0"
    title={t("footer.contact")}
    priority={2}
  >
    <span className="text-gray-950">
      <SidebarListingQuestion />
      <SidebarSFHelp />
      <SidebarContactInfo />
    </span>
  </SidebarBlock>
)

export default ContactSideBarBlock
