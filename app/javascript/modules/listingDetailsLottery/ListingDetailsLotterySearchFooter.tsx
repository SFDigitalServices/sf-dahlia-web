import React from "react"
import { t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"
import { LOTTERY_SEARCH_FORM_STATUS } from "./ListingDetailsLotterySearchForm"
import { RailsListing } from "../listings/SharedHelpers"
import "./ListingDetailsLotterySearchFooter.scss"

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
      <div className="bg-gray-100 py-4 text-center">
        <a
          className="lottery-results-modal-anchor"
          href="http://sfmohcd.org/housing-preference-programs"
          target="_blank"
        >
          {t("lottery.readAboutPreferences")}
        </a>
      </div>
      {lotterySearchFormStatus === LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE && (
        <>
          {listing.LotteryResultsURL ? (
            <>
              <div className="p-4 text-center text-tiny">
                <p className="py-2">
                  {t("lottery.resultsFrom", {
                    date: localizedFormat(listing.Lottery_Results_Date, "LL"),
                  })}
                </p>
                <p className="py-2">
                  <a
                    href={listing.LotteryResultsURL}
                    target="_blank"
                    className="lottery-results-modal-anchor"
                  >
                    {t("lottery.lotteryResultsPdfLink")}
                  </a>
                </p>
                <p className="text-gray-700 py-2">
                  {t("lottery.unsortedResultsNote", {
                    date: localizedFormat(listing.Lottery_Date, "LL"),
                  })}
                </p>
              </div>
            </>
          ) : (
            <>
              {listing.Lottery_Results_Date && (
                <div className="p-4 text-center text-tiny">
                  <p className="py-2">
                    {t("lottery.resultsWillBePostedOn", {
                      date: localizedFormat(listing.Lottery_Results_Date, "LL"),
                    })}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
