import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { AppearanceStyleType, t, SidebarBlock, LinkButton } from "@bloom-housing/ui-components"
import { isLotteryComplete } from "../../util/listingUtil"
import { ListingLotteryPreference } from "../../api/types/rails/listings/BaseRailsListing"

export interface ListingDetailsLotteryPreferenceLists {
  listing: RailsListing
  isApplicationOpen: boolean
}

export const ListingDetailsLotteryPreferenceLists = ({
  listing,
  isApplicationOpen,
}: ListingDetailsLotteryPreferenceLists) => {
  if (isLotteryComplete(listing) || isApplicationOpen) {
    return null
  }

  return (
    <>
      {listing.Listing_Lottery_Preferences?.filter((preference: ListingLotteryPreference) => {
        return !!preference.PDF_URL
      }).map((preference: ListingLotteryPreference) => {
        return (
          <div
            key={preference.Lottery_Preference.Name}
            className="border-b border-gray-400 md:border-b-0"
          >
            <SidebarBlock
              title={t("listings.confirmedPreferenceList", {
                preference: t(
                  `listings.lotteryPreference.${preference.Lottery_Preference.Name}.title`
                ),
              })}
            >
              <LinkButton
                styleType={AppearanceStyleType.primary}
                className={"w-full mt-1"}
                transition={true}
                href={preference.PDF_URL}
              >
                {t("lottery.viewPreferenceList")}
              </LinkButton>
              <p className="mt-4">{t("lottery.applicationsThatQualifyForPreference")}</p>
            </SidebarBlock>
          </div>
        )
      })}
    </>
  )
}
