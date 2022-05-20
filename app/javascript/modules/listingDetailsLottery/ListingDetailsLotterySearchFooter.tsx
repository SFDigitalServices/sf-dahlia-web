import React from "react"
import { t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"
import { LOTTERY_SEARCH_FORM_STATUS } from "./ListingDetailsLotterySearchForm"
import { RailsListing } from "../listings/SharedHelpers"

interface ListingDetailsLotterySearchFooterProps {
  lotterySearchFormStatus: LOTTERY_SEARCH_FORM_STATUS
  listing: RailsListing
}

export const ListingDetailsLotterySearchFooter = ({
  lotterySearchFormStatus,
  listing,
}: ListingDetailsLotterySearchFooterProps) => {
  return (
    <>
      <div className="bg-gray-100 mb-2 py-4 text-center">
        <a href="http://sfmohcd.org/housing-preference-programs" target="_blank">
          {t("lottery.readAboutPreferences")}
        </a>
      </div>
      {lotterySearchFormStatus === LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE && (
        <div className="p-4 text-center text-tiny">
          <p className="py-2">
            {t("lottery.resultsFrom", {
              date: localizedFormat(listing.Lottery_Results_Date, "LL"),
            })}
          </p>
          <p className="py-2">
            <a href={listing.LotteryResultsURL} target="_blank">
              {t("lottery.lotteryResultsPdfLink")}
            </a>
          </p>
          <p className="text-gray-700 py-2">
            {t("lottery.unsortedResultsNote", {
              date: localizedFormat(listing.Lottery_Date, "LL"),
            })}
          </p>
        </div>
      )}
    </>
  )
}
