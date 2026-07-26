/**
 * Bidirectional value codecs for translating between form engine `formData`
 * values and the Salesforce-shaped `Application` payload.
 *
 * Each codec is a `{ toSf, fromSf }` pair that must round-trip: for any value
 * the form can produce, `fromSf(toSf(v))` should equal `v`. Codecs that cannot
 * round-trip losslessly say so in a comment.
 *
 * Ported from the Angular ShortFormDataService `_format*` / `_reformat*`
 * helpers, which implemented each direction as a separate function. Pairing
 * them here keeps the two directions from drifting apart.
 */

import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

export interface Codec<TForm = unknown, TSf = unknown> {
  toSf: (value: TForm) => TSf
  fromSf: (value: TSf) => TForm
}

/** Passes the value through untouched, normalizing empty values to undefined. */
export const identity: Codec<unknown, unknown> = {
  toSf: (value) => (value === null || value === "" ? undefined : value),
  fromSf: (value) => (value === undefined || value === null ? "" : value),
}

/** Trims strings and drops empty ones. */
export const text: Codec<string, string> = {
  toSf: (value) => {
    return value?.trim() || undefined
  },
  fromSf: (value) => value ?? "",
}

/**
 * Salesforce stores several tri-state answers as the strings "true" / "false",
 * with null meaning unanswered. The form uses radio values "Yes" / "No".
 * Angular: `_formatBoolean` / `_reformatBoolean`.
 */
export const yesNoToBooleanString: Codec<string, "true" | "false"> = {
  toSf: (value) => {
    if (value === "Yes") return "true"
    if (value === "No") return "false"
    return undefined
  },
  fromSf: (value) => {
    if (value === "true") return "Yes"
    if (value === "false") return "No"
    return null
  },
}

/** As above, but for the fields Salesforce types as a real boolean. */
export const yesNoToBoolean: Codec<string, boolean> = {
  toSf: (value) => {
    if (value === "Yes") return true
    if (value === "No") return false
    return undefined
  },
  fromSf: (value) => {
    if (value === true) return "Yes"
    if (value === false) return "No"
    return null
  },
}

/**
 * A form checkbox (truthy / falsy) against a Salesforce boolean.
 *
 * A checkbox the applicant never saw is omitted rather than sent as `false`,
 * matching Angular's `_.pick`-based whitelisting. Once the field exists in
 * formData, an unchecked box does send `false`.
 */
export const checkboxToBoolean: Codec<unknown, boolean> = {
  toSf: (value) => (value === undefined || value === null ? undefined : !!value),
  fromSf: (value) => !!value,
}

/**
 * Salesforce multi-selects are semicolon-delimited and semicolon-terminated
 * ("Adaptable;Vision impairments;"). The form holds an array of selected keys.
 * Angular: `_formatPickList` / `_reformatMultiSelect`.
 */
export const pickList: Codec<string[], string> = {
  toSf: (value) => {
    if (!value?.length) return undefined
    return value.map((key) => `${key};`).join("")
  },
  fromSf: (value) =>
    (value ?? "")
      .split(";")
      .map((key) => key.trim())
      .filter(Boolean),
}

/** Currency and score fields arrive from the form as strings. */
export const number: Codec<string, number> = {
  toSf: (value) => {
    if (value === null || value === undefined || value === "") return undefined
    const parsed = Number(String(value).replace(/[$,]/g, ""))
    return Number.isNaN(parsed) ? undefined : parsed
  },
  fromSf: (value) => (value === null || value === undefined ? "" : String(value)),
}

/**
 * The form collects a birth date as three separate inputs; Salesforce wants a
 * single zero-padded "YYYY-MM-DD".
 * Angular: `formatUserDOB` / `reformatDOB`.
 */
export const dateOfBirth: Codec<[string, string, string], string> = {
  toSf: ([year, month, day]) => {
    if (!year || !month || !day) return undefined
    const parsed = dayjs(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      "YYYY-MM-DD",
      true
    )
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : undefined
  },
  fromSf: (value) => {
    const [year, month, day] = (value ?? "").split("-")
    return [year ?? "", month ?? "", day ?? ""]
  },
}

/**
 * Salesforce has one street field per address; the form keeps the street and
 * the apt/unit separately.
 *
 * NOTE: lossy by design, matching the Angular behavior. `toSf` joins with a
 * space and `fromSf` cannot know where the unit began, so it returns the whole
 * string as the street and an empty unit. Round-tripping a draft moves the unit
 * into the street field. Tracked for DAH-3533 (draft resume) — if we want this
 * to round-trip we need the unit preserved in `formMetadata`.
 */
export const streetAndUnit: Codec<[string, string], string> = {
  toSf: ([street, unit]) => {
    return (
      [street, unit]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ") || undefined
    )
  },
  fromSf: (value) => [value ?? "", ""],
}
