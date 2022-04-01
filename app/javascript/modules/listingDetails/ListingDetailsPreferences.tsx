import React, { useEffect, useState } from "react"
import { ListSection, LoadingOverlay, PreferencesList, t } from "@bloom-housing/ui-components"
import { RailsListingPreference } from "../../api/types/rails/listings/RailsListingPreferences"
import { PREFERENCES, PREFERENCES_WITH_PROOF } from "../constants"
import { getPreferences } from "../../api/listingApiService"

export interface ListingDetailsPreferencesProps {
  listingID: string
}
export const ListingDetailsPreferences = ({ listingID }: ListingDetailsPreferencesProps) => {
  const [preferences, setPreferences] = useState<RailsListingPreference[]>([])

  useEffect(() => {
    void getPreferences(listingID).then((preferences) => {
      setPreferences(preferences)
    })
  }, [listingID])

  return (
    <ListSection title={t("listings.lottery.title")} subtitle={t("listings.lottery.preferences")}>
      <LoadingOverlay isLoading={preferences.length === 0}>
        <>
          <PreferencesList
            listingPreferences={preferences.map((preference, index) => {
              const links = []
              if (preference.readMoreUrl) {
                links.push({ title: t("label.read_more"), url: preference.readMoreUrl })
              }
              // TODO: DAH-1138 rewrite document-checklist page and link to appropriate section
              if (PREFERENCES_WITH_PROOF.includes(preference.preferenceName)) {
                links.push({
                  title: t("label.view_document_checklist"),
                  url: "/document-checklist",
                })
              }

              return {
                description:
                  preference.preferenceName === PREFERENCES.neighborhoodResidence &&
                  preference.NRHPDistrict
                    ? t(
                        "listings.lottery_preference.Neighborhood Resident Housing Preference (NRHP).desc.withDistrict",
                        { number: preference.NRHPDistrict }
                      )
                    : t(`listings.lottery_preference.${preference.preferenceName}.desc`),
                links,
                ordinal: index + 1,
                subtitle:
                  preference.unitsAvailable &&
                  t("listings.lottery_preference.up_to_units", {
                    units: preference.unitsAvailable,
                  }),
                title: t(`listings.lottery_preference.${preference.preferenceName}.title`),
              }
            })}
          />
          {preferences.length > 0 && (
            <p className="text-gray-700 text-tiny">
              {t("listings.lottery_preference.remaining_units_after_preference_consideration")}
            </p>
          )}
        </>
      </LoadingOverlay>
    </ListSection>
  )
}
