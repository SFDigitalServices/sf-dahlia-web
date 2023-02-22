import React, { useEffect, useState } from "react"
import { Icon, PreferencesList, t } from "@bloom-housing/ui-components"
import { RailsListingPreference } from "../../api/types/rails/listings/RailsListingPreferences"
import { PREFERENCES, PREFERENCES_WITH_PROOF } from "../constants"
import { getPreferences } from "../../api/listingApiService"
import "./ListingDetailsPreferences.scss"

const determineDescription = (
  customPreferenceDescription: boolean,
  listingDescription: string,
  preferenceName: string,
  NRHPDistrict?: string
) => {
  if (customPreferenceDescription) {
    return { description: listingDescription, descriptionClassName: "translate" }
  } else {
    return preferenceName === PREFERENCES.neighborhoodResidence && NRHPDistrict
      ? {
          description: t(
            "listings.lotteryPreference.Neighborhood Resident Housing Preference (NRHP).desc.withDistrict",
            { number: NRHPDistrict }
          ),
        }
      : {
          description: t(`listings.lotteryPreference.${preferenceName}.desc`),
        }
  }
}
export interface ListingDetailsPreferencesProps {
  listingID: string
}
export const ListingDetailsPreferences = ({ listingID }: ListingDetailsPreferencesProps) => {
  const [preferences, setPreferences] = useState<RailsListingPreference[]>([])

  useEffect(() => {
    void getPreferences(listingID).then((preferences) => {
      setPreferences(preferences)
    })
    return () => {
      setPreferences([])
    }
  }, [listingID])

  if (preferences?.length === 0) {
    return (
      <div className="flex justify-center">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  return (
    <>
      <PreferencesList
        listingPreferences={preferences?.map((preference, index) => {
          const links = []
          if (preference.readMoreUrl) {
            links.push({ title: t("label.readMore"), url: preference.readMoreUrl })
          }
          // TODO: DAH-1138 rewrite document-checklist page and link to appropriate section
          if (PREFERENCES_WITH_PROOF.includes(preference.preferenceName)) {
            links.push({
              title: t("label.viewDocumentChecklist"),
              url: "/document-checklist",
            })
          }

          return {
            ...determineDescription(
              preference.customPreferenceDescription,
              preference.description,
              preference.preferenceName,
              preference.NRHPDistrict
            ),
            links,
            ordinal: index + 1,
            subtitle:
              preference.unitsAvailable &&
              t("listings.lotteryPreference.upToUnits", {
                units: preference.unitsAvailable,
              }),
            title: t(`listings.lotteryPreference.${preference.preferenceName}.title`),
          }
        })}
      />
      {preferences.length > 0 && (
        <p className="text-gray-750 text-sm">
          {t("listings.lotteryPreference.remainingUnitsAfterPreferenceConsideration")}
        </p>
      )}
    </>
  )
}
