import React, { useEffect, useState } from "react"
import { Icon, PreferencesList, t } from "@bloom-housing/ui-components"
import { RailsListingPreference } from "../../api/types/rails/listings/RailsListingPreferences"
import { PREFERENCES, PREFERENCES_IDS, PREFERENCES_WITH_PROOF } from "../constants"
import { getPreferences } from "../../api/listingApiService"
import "./ListingDetailsPreferences.scss"
import { getLocalizedPath } from "../../util/routeUtil"
import { getRoutePrefix, getSfGovUrl } from "../../util/languageUtil"

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

export const mapPreferenceLink = (link: string): string => {
  switch (link) {
    case "http://sfmohcd.org/certificate-preference":
      return getSfGovUrl(link, 3275)
    case "http://sfmohcd.org/displaced-tenant-housing-preference":
      return getSfGovUrl(link, 7488)
    case "http://sfmohcd.org/housing-preference-programs":
      return getSfGovUrl(link, 3274)
    case "http://sfmohcd.org/neighborhood-resident-housing-preference":
      return getSfGovUrl(link, 3274)
    default:
      return link
  }
}

export const ListingDetailsPreferences = ({ listingID }: ListingDetailsPreferencesProps) => {
  const [preferences, setPreferences] = useState<RailsListingPreference[]>([])

  useEffect(() => {
    void getPreferences(listingID).then((preferences) => {
      setPreferences(
        preferences?.filter(
          (preference) => !preference.preferenceName.toLowerCase().includes("veteran")
        )
      )
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
            links.push({
              title: t("label.readMore"),
              url: mapPreferenceLink(preference.readMoreUrl),
              ariaLabel: t(`listings.lotteryPreference.${preference.preferenceName}.readMore`),
            })
          }
          if (PREFERENCES_WITH_PROOF.includes(preference.preferenceName)) {
            const routePrefix = getRoutePrefix(window.location.pathname)
            const anchorMap = {
              "Neighborhood Resident Housing Preference (NRHP)":
                PREFERENCES_IDS.neighborhoodResidence,
              "Rent Burdened / Assisted Housing Preference": PREFERENCES_IDS.assistedHousing,
              "Live or Work in San Francisco Preference": PREFERENCES_IDS.liveWorkInSf,
              "Alice Griffith Housing Development Resident": PREFERENCES_IDS.aliceGriffith,
            }
            links.push({
              title: t("label.viewDocumentChecklist"),
              ariaLabel: t(
                `listings.lotteryPreference.${preference.preferenceName}.additionalDocumentation`
              ),
              url:
                typeof routePrefix === "undefined"
                  ? `/document-checklist#${anchorMap[preference.preferenceName]}`
                  : getLocalizedPath(
                      `/document-checklist#${anchorMap[preference.preferenceName]}`,
                      routePrefix
                    ),
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
