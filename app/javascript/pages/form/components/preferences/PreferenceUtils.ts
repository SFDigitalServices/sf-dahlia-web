import type { RailsListingPreference } from "../../../../api/types/rails/listings/RailsListingPreferences"
import { PREFERENCES } from "../../../../modules/constants"

export type PreferenceContent = {
  preferenceName: string
  checkboxLabel: string
  checkboxDescription: string
  proofHouseholdMemberLabel: string
  proofTypeLabel?: string
  proofTypeNote?: string
  proofTypeSingleValue?: string
  certificateNumberLabel?: string
  certificateNumberNote?: string
  proofUploadButtonLabel: string
}

// Preference pages have more complex fields, so we generate
// the fieldNames within the component, instead of in the schema.
export type PreferenceFieldNames = {
  preferenceClaimed: string
  subPreferenceClaimed?: string // for live-work combo preference
  householdMemberId: string
  certificateNumber: string
  proofType: string
  proofFileName: string
  proofFileUploadedAt: string
}

export type ClaimedPreference = {
  preferenceClaimed: boolean
  householdMemberId?: string
  proofType?: string
  proofFileName?: string
  proofFileUploadedAt?: string
  certificateNumber?: string
}

// dot notation for nested values
// https://react-hook-form-website-git-leagcy-hook-form.vercel.app/v6/api/#register
export const generatePreferenceFieldNames = (preferenceName: string): PreferenceFieldNames => ({
  preferenceClaimed: `claimedPreferences.${preferenceName}.preferenceClaimed`,
  subPreferenceClaimed: `claimedPreferences.${preferenceName}.preferenceSelection`,
  householdMemberId: `claimedPreferences.${preferenceName}.householdMemberId`,
  certificateNumber: `claimedPreferences.${preferenceName}.certificateNumber`,
  proofType: `claimedPreferences.${preferenceName}.proofType`,
  proofFileName: `claimedPreferences.${preferenceName}.proofFileName`,
  proofFileUploadedAt: `claimedPreferences.${preferenceName}.proofFileUploadedAt`,
})

export const getPreferenceData = (
  preferences: RailsListingPreference[] | undefined,
  preferenceName: string
): RailsListingPreference => {
  const preferenceLongName = PREFERENCES[preferenceName]
  if (!preferenceLongName) throw new Error(`${preferenceName} is not a valid preference name.`)

  const preference = preferences?.find((pref) => pref.preferenceName === preferenceLongName)
  if (!preference) throw new Error(`${preferenceLongName} is missing for this listing.`)

  return preference
}
