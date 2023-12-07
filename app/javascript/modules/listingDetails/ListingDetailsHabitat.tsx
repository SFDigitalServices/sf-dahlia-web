import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Heading, t } from "@bloom-housing/ui-components"
import { getSfGovUrl, renderMarkup } from "../../util/languageUtil"
import { isHabitatListing } from "../../util/listingUtil"

export interface ListingDetailsHabitatProps {
  listing: RailsListing
}

export const ListingDetailsHabitat = ({ listing }: ListingDetailsHabitatProps) => {
  if (!isHabitatListing(listing)) return null

  return (
    <div className="md:pr-8 md:w-2/3 mt-4 mx-2 w-full">
      <Heading priority={4} styleType="underlineWeighted">
        {t("listings.habitat.payments.title")}
      </Heading>
      <p>{t("listings.habitat.payments.p1")}</p>
      <Heading className="mt-8" priority={4} styleType="underlineWeighted">
        {t("listings.habitat.sweatEquity.title")}
      </Heading>
      <p>{t("listings.habitat.sweatEquity.p1")}</p>
      <p className="mt-4">{t("listings.habitat.sweatEquity.p2")}</p>
      <Heading className="mt-8" priority={4} styleType="underlineWeighted">
        {t("listings.habitat.applicationProcess.title")}
      </Heading>
      <p>
        {renderMarkup(
          t("listings.habitat.applicationProcess.p1", {
            habitatLink: "https://habitatgsf.org/amber-drive-info/",
          })
        )}
      </p>
      <ol className="list-decimal ml-8 mt-4">
        <li>
          {renderMarkup(
            t("listings.habitat.applicationProcess.ol1", {
              infoSessionLink: "https://habitatgsf.org/amber-drive-info/",
            })
          )}
        </li>
        <li>{t("listings.habitat.applicationProcess.ol2")}</li>
        <li>{t("listings.habitat.applicationProcess.ol3")}</li>
        <li>{t("listings.habitat.applicationProcess.ol4")}</li>
        <li>{t("listings.habitat.applicationProcess.ol5")}</li>
        <li>{t("listings.habitat.applicationProcess.ol6")}</li>
        <li>{t("listings.habitat.applicationProcess.ol7")}</li>
        <li>{t("listings.habitat.applicationProcess.ol8")}</li>
        <li>{t("listings.habitat.applicationProcess.ol9")}</li>
        <li>{t("listings.habitat.applicationProcess.ol10")}</li>
      </ol>
      <Heading className="mt-8" priority={4} styleType="underlineWeighted">
        {t("listings.habitat.incomeRange.title")}
      </Heading>
      <p>{t("listings.habitat.incomeRange.p1")}</p>
      <p className="mt-4">{t("listings.habitat.incomeRange.p2")}</p>
      <p className="mt-4">
        {renderMarkup(
          t("listings.incomeExceptions.intro", {
            url: getSfGovUrl(
              "https://sf.gov/information/special-calculations-household-income",
              7080
            ),
          })
        )}
      </p>
      <ul className="list-disc ml-6">
        <li>{t("listings.incomeExceptions.students")}</li>
        <li>{t("listings.incomeExceptions.nontaxable")}</li>
      </ul>
      <p className="mt-4">{t("listings.habitat.incomeRange.p4")}</p>
      {/* TODO: Dependent on DAH-1139 */}
    </div>
  )
}
