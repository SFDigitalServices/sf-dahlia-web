/**
 * Transforms that span more than one field and so can't be expressed as a
 * single field-map entry. Each is still written as a `{ toSf, fromSf }` pair for
 * the same reason the codecs are: so the two directions stay together.
 *
 * Keep this file small. If something here turns out to be a plain rename,
 * move it into `fieldMaps.ts`.
 */

import { HCBS_PRIORITY_NAME } from "./constants"

type Data = Record<string, unknown>

export interface CrossFieldTransform {
  toSf: (formData: Data) => Data
  fromSf: (sfData: Data) => Data
}

/**
 * One form amount + timeframe becomes one of two Salesforce fields.
 * Angular: `_formatIncome` / `_reformatIncome`.
 */
export const income: CrossFieldTransform = {
  toSf: (formData) => {
    const entered = formData.householdIncome as string | number | undefined
    const amount = Number(String(entered ?? "").replace(/[$,]/g, ""))
    if (!entered || Number.isNaN(amount)) return {}
    return formData.householdIncomeMultiplier === "per_month"
      ? { monthlyIncome: amount }
      : { annualIncome: amount }
  },
  fromSf: (sfData) => {
    const monthly = sfData.monthlyIncome as number | undefined
    if (monthly) {
      return { householdIncome: String(monthly), householdIncomeMultiplier: "per_month" }
    }
    const annual = sfData.annualIncome as number | undefined
    if (annual) {
      return { householdIncome: String(annual), householdIncomeMultiplier: "per_year" }
    }
    return {}
  },
}

/**
 * ADA priorities are a semicolon-delimited multi-select, but the "home and
 * community based services" answer is a separate yes/no question in the form
 * that Salesforce expects folded into the same picklist, so it shows up
 * alongside the priorities in the Leasing Agent Portal.
 * Angular: the HCBS block in `formatApplication` / `reformatApplication`.
 */
export const adaPriorities: CrossFieldTransform = {
  toSf: (formData) => {
    const selected = [...((formData.adaPrioritiesSelected as string[]) ?? [])].filter(
      (priority) => priority !== "None"
    )
    if (formData.hasHomeAndCommunityBasedServices === "Yes") {
      selected.push(HCBS_PRIORITY_NAME)
    }
    if (selected.length === 0) return { adaPrioritiesSelected: "None;" }
    return { adaPrioritiesSelected: selected.map((priority) => `${priority};`).join("") }
  },
  fromSf: (sfData) => {
    const selected = ((sfData.adaPrioritiesSelected as string) ?? "")
      .split(";")
      .map((priority) => priority.trim())
      .filter((priority) => priority && priority !== "None")
    const hasHcbs = selected.includes(HCBS_PRIORITY_NAME)
    return {
      adaPrioritiesSelected: selected.filter((priority) => priority !== HCBS_PRIORITY_NAME),
      hasHomeAndCommunityBasedServices: hasHcbs ? "Yes" : "No",
    }
  },
}

/**
 * Total monthly rent is the sum of the per-address rents collected on the
 * household monthly rent step.
 * Angular: `_calculateTotalMonthlyRent`.
 *
 * NOTE: not invertible — the sum can't be split back into per-address values.
 * `fromSf` returns nothing and relies on the grouped addresses being restored
 * from `formMetadata` instead.
 */
export const totalMonthlyRent: CrossFieldTransform = {
  toSf: (formData) => {
    const addresses = (formData.groupedHouseholdAddresses as { monthlyRent?: unknown }[]) ?? []
    if (addresses.length === 0) return {}
    const total = addresses.reduce((sum, address) => sum + (Number(address.monthlyRent) || 0), 0)
    return { totalMonthlyRent: total }
  },
  fromSf: () => ({}),
}

/**
 * Fields the form needs on resume but Salesforce has no column for get stashed
 * in a JSON string. This is also where anything that doesn't round-trip through
 * a codec should be preserved.
 * Angular: `_formatMetadata` / `_reformatMetadata`.
 */
export const META_FIELDS = [
  "completedSections",
  "session_uid",
  "lastPage",
  "groupedHouseholdAddresses",
] as const

export const formMetadata: CrossFieldTransform = {
  toSf: (formData) => {
    const metadata: Data = {}
    for (const field of META_FIELDS) {
      if (formData[field] !== undefined) metadata[field] = formData[field]
    }
    return { formMetadata: JSON.stringify(metadata) }
  },
  fromSf: (sfData) => {
    if (!sfData.formMetadata) return {}
    try {
      const parsed = JSON.parse(sfData.formMetadata as string) as Data
      const result: Data = {}
      for (const field of META_FIELDS) {
        if (parsed[field] !== undefined) result[field] = parsed[field]
      }
      return result
    } catch {
      console.error("Could not parse formMetadata")
      return {}
    }
  },
}

/**
 * Geocoding results arrive from the address verification API as a nested object
 * and are stored flat. Applies to the primary applicant and each household
 * member, so it takes an optional form field prefix.
 * Angular: `_formatGeocodingData`.
 */
export const geocodingDataToFormData = (
  geocodingData:
    | {
        location?: { x?: unknown; y?: unknown }
        attributes?: { Loc_name?: unknown }
        score?: unknown
      }
    | undefined,
  prefix = ""
): Data => {
  if (!geocodingData) return {}
  const key = (name: string) =>
    prefix ? prefix + name.charAt(0).toUpperCase() + name.slice(1) : name
  return {
    [key("xCoordinate")]: geocodingData.location?.x,
    [key("yCoordinate")]: geocodingData.location?.y,
    [key("whichComponentOfLocatorWasUsed")]: geocodingData.attributes?.Loc_name,
    [key("candidateScore")]: geocodingData.score,
  }
}
