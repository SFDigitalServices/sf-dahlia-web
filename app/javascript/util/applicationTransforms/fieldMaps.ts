/**
 * The field tables.
 *
 * This is the file you edit when a new field is added to the form. Add one
 * entry to the appropriate table and both the submit and the draft-resume
 * direction are handled.
 *
 * Field name sources:
 *  - form side: the `fieldNames` maps in
 *    `app/javascript/formEngine/listingApplicationDefaultRental.json`
 *  - Salesforce side: `app/javascript/api/types/rails/application/RailsApplication.d.ts`
 *    (and the Angular `WHITELIST_FIELDS`, which is the set Salesforce accepts)
 *
 * Note on structure: the Angular code did a lot of address flattening
 * (`_formatAddress` / `_reformatHomeAddress`) because *Angular's* model was
 * nested (`applicant.home_address.address1`). Salesforce itself is flat, and so
 * is the form engine's `formData`, so that flattening is no longer needed —
 * those transforms reduce to the plain renames below.
 */

import {
  checkboxToBoolean,
  dateOfBirth,
  number,
  pickList,
  streetAndUnit,
  text,
  yesNoToBoolean,
  yesNoToBooleanString,
} from "./codecs"
import { type FieldMap } from "./fieldMap"

/**
 * Fields shared by the primary applicant and household members. Used unprefixed
 * for household member entries and prefixed with "primaryApplicant" for the
 * applicant, via `prefixForm`.
 */
export const appMemberFieldMap: FieldMap = [
  { form: "appMemberId", sf: "appMemberId" },
  { form: "firstName", sf: "firstName", codec: text },
  { form: "middleName", sf: "middleName", codec: text },
  { form: "lastName", sf: "lastName", codec: text },
  { form: ["birthYear", "birthMonth", "birthDate"], sf: "dob", codec: dateOfBirth },
  { form: ["addressStreet", "addressAptOrUnit"], sf: "address", codec: streetAndUnit },
  { form: "addressCity", sf: "city", codec: text },
  { form: "addressState", sf: "state" },
  { form: "addressZipcode", sf: "zip", codec: text },
  { form: "noAddress", sf: "noAddress", codec: checkboxToBoolean },
  { form: "workInSf", sf: "workInSf", codec: yesNoToBooleanString },
  { form: "neighborhoodPreferenceAddressMatch", sf: "preferenceAddressMatch" },
  // geocoding results, written by the address verification step
  { form: "xCoordinate", sf: "xCoordinate" },
  { form: "yCoordinate", sf: "yCoordinate" },
  { form: "whichComponentOfLocatorWasUsed", sf: "whichComponentOfLocatorWasUsed" },
  { form: "candidateScore", sf: "candidateScore", codec: number },
  // isVeteran is derived across all members rather than mapped per member;
  // see applyVeteranStatus in veterans.ts (DAH-3678)
]

/** Primary-applicant-only fields (contact info the household members lack). */
export const primaryApplicantOnlyFieldMap: FieldMap = [
  { form: "primaryApplicantContactId", sf: "contactId" },
  { form: "primaryApplicantPhone", sf: "phone", codec: text },
  { form: "primaryApplicantPhoneType", sf: "phoneType" },
  { form: "primaryApplicantAdditionalPhone", sf: "alternatePhone", codec: text },
  { form: "primaryApplicantAdditionalPhoneType", sf: "alternatePhoneType" },
  { form: "_primaryApplicantNoPhoneCheckbox", sf: "noPhone", codec: checkboxToBoolean },
  { form: "primaryApplicantEmail", sf: "email", codec: text },
  { form: "primaryApplicantNoEmailCheckbox", sf: "noEmail", codec: checkboxToBoolean },
  {
    form: "_primaryApplicantMailingAddressCheckbox",
    sf: "hasAltMailingAddress",
    codec: checkboxToBoolean,
  },
  { form: "primaryApplicantMailingAddressStreet", sf: "mailingAddress", codec: text },
  { form: "primaryApplicantMailingAddressCity", sf: "mailingCity", codec: text },
  { form: "primaryApplicantMailingAddressState", sf: "mailingState" },
  { form: "primaryApplicantMailingAddressZipcode", sf: "mailingZip", codec: text },
  // custom educator listing (DAH-3679)
  { form: "customEducatorScreeningAnswer", sf: "isSFUSDEmployee" },
  { form: "customEducatorJobClassificationNumber", sf: "jobClassification" },
]

/** Household-member-only fields. */
export const householdMemberOnlyFieldMap: FieldMap = [
  { form: "relationship", sf: "relationship" },
  {
    form: "hasSameAddressAsApplicant",
    sf: "hasSameAddressAsApplicant",
    codec: yesNoToBoolean,
  },
]

/** Demographics, collected on the optional review step (DAH-3612). */
export const demographicsFieldMap: FieldMap = [
  { form: "primaryApplicantGender", sf: "gender" },
  { form: "primaryApplicantGenderOther", sf: "genderOther", codec: text },
  { form: "primaryApplicantPrimaryLanguage", sf: "primaryLanguage" },
  { form: "primaryApplicantOtherLanguage", sf: "otherLanguage", codec: text },
  { form: "primaryApplicantSexualOrientation", sf: "sexualOrientation" },
  { form: "primaryApplicantSexualOrientationOther", sf: "sexualOrientationOther", codec: text },
  // raceEthnicity is a semicolon-delimited multi-select of "Parent - Suboption"
  // keys; the accordion component holds it as an array
  { form: "primaryApplicantRaceEthnicity", sf: "raceEthnicity", codec: pickList },
  { form: "primaryApplicantAsianOther", sf: "asianOther", codec: text },
  { form: "primaryApplicantBlackOther", sf: "blackOther", codec: text },
  { form: "primaryApplicantIndigenousOther", sf: "indigenousOther", codec: text },
  { form: "primaryApplicantLatinoOther", sf: "latinoOther", codec: text },
  { form: "primaryApplicantMenaOther", sf: "menaOther", codec: text },
  { form: "primaryApplicantPacificIslanderOther", sf: "pacificIslanderOther", codec: text },
  { form: "primaryApplicantWhiteOther", sf: "whiteOther", codec: text },
  {
    form: "primaryApplicantIndigenousNativeAmericanGroup",
    sf: "indigenousNativeAmericanGroup",
    codec: text,
  },
  {
    form: "primaryApplicantIndigenousCentralSouthAmericaGroup",
    sf: "indigenousCentralSouthAmericaGroup",
    codec: text,
  },
]

/** Alternate contact (DAH-3680). */
export const alternateContactFieldMap: FieldMap = [
  { form: "alternateContactAppMemberId", sf: "appMemberId" },
  { form: "alternateContactType", sf: "alternateContactType" },
  { form: "alternateContactTypeOther", sf: "alternateContactTypeOther", codec: text },
  { form: "alternateContactFirstName", sf: "firstName", codec: text },
  { form: "alternateContactLastName", sf: "lastName", codec: text },
  { form: "alternateContactAgency", sf: "agency", codec: text },
  { form: "alternateContactPhone", sf: "phone", codec: text },
  { form: "alternateContactEmail", sf: "email", codec: text },
  // the alternate contact's address is stored in the mailing* fields in
  // Salesforce, matching Angular's _formatAddress(..., 'mailing_address')
  { form: "alternateContactAddressStreet", sf: "mailingAddress", codec: text },
  { form: "alternateContactAddressCity", sf: "mailingCity", codec: text },
  { form: "alternateContactAddressState", sf: "mailingState" },
  { form: "alternateContactAddressZipcode", sf: "mailingZip", codec: text },
]

/**
 * Top-level application fields that map one-to-one (DAH-3683).
 *
 * Fields that need cross-field logic are handled separately and are
 * deliberately absent here: income (annual vs monthly timeframe),
 * adaPrioritiesSelected (HCBS special case), totalMonthlyRent (summed),
 * formMetadata (JSON blob), and the veteran fields.
 */
export const applicationFieldMap: FieldMap = [
  { form: "id", sf: "id" },
  { form: "hasPublicHousing", sf: "hasPublicHousing" },
  { form: "hasMilitaryService", sf: "hasMilitaryService" },
  { form: "hasDevelopmentalDisability", sf: "hasDevelopmentalDisability" },
  { form: "answeredCommunityScreening", sf: "answeredCommunityScreening" },
  { form: "householdVouchersSubsidies", sf: "householdVouchersSubsidies", codec: yesNoToBooleanString },
  { form: "referral", sf: "referral" },
  { form: "agreeToTerms", sf: "agreeToTerms", codec: checkboxToBoolean },
  { form: "externalSessionId", sf: "externalSessionId" },
  // sales-listing fields, not used by the rental form yet
  { form: "isFirstTimeHomebuyer", sf: "isFirstTimeHomebuyer", codec: checkboxToBoolean },
  { form: "hasMinimumCreditScore", sf: "hasMinimumCreditScore", codec: checkboxToBoolean },
  {
    form: "hasCompletedHomebuyerEducation",
    sf: "hasCompletedHomebuyerEducation",
    codec: checkboxToBoolean,
  },
  { form: "hasLoanPreapproval", sf: "hasLoanPreapproval", codec: checkboxToBoolean },
  { form: "lendingAgent", sf: "lendingAgent" },
  { form: "homebuyerEducationAgency", sf: "homebuyerEducationAgency" },
  // calculated by Salesforce; read on resume, never submitted
  { form: "lotteryNumber", sf: "lotteryNumber", readOnly: true },
]
