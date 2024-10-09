import React from "react"
import { t } from "@bloom-housing/ui-components"
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
      <div className="bg-gray-100 py-4 px-8 md:px-0 text-center">
        <a
          className="text-blue-900"
          href="http://sfmohcd.org/housing-preference-programs"
          target="_blank"
        >
          {t("lottery.readAboutPreferences")}
        </a>
      </div>
      {lotterySearchFormStatus === LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE && (
        <>
          {listing.LotteryResultsURL && (
            <div className="p-4 text-center text-sm">
              <p className="py-2">
                <a href={listing.LotteryResultsURL} target="_blank" className="text-blue-900">
                  {t("lottery.downloadLotteryResultsPdf.temp")}
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
