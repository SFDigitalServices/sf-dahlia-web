/**
 * The mapping engine.
 *
 * A field map is an array of entries, each describing one correspondence
 * between form engine field name(s) and a Salesforce field name, plus the codec
 * to apply. `applyToSf` and `applyFromSf` walk the same array in opposite
 * directions, so adding a field means adding one line to one table and both
 * directions are covered.
 */

import { type Codec, identity } from "./codecs"

/**
 * One field correspondence.
 *
 * `form` is the form engine field name, or an array of names for codecs that
 * combine several inputs into one Salesforce value (date of birth, street +
 * unit). The codec's form-side type must be a tuple of the same arity.
 *
 * `sf` is the field name on the Salesforce-shaped object.
 *
 * `codec` defaults to `identity`.
 *
 * `readOnly` marks fields Salesforce calculates and we never send; they are
 * read on the way in and skipped on the way out.
 */
export interface FieldMapEntry {
  form: string | string[]
  sf: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  codec?: Codec<any, any>
  readOnly?: boolean
}

export type FieldMap = FieldMapEntry[]

type Data = Record<string, unknown>

/**
 * Prefixes the form-side names of a map. Household members and the primary
 * applicant share a field set but namespace it differently in formData
 * ("primaryApplicantFirstName" vs the unprefixed "firstName" inside a
 * householdMembers[] entry), so the same table serves both.
 */
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const prefixForm = (map: FieldMap, prefix: string): FieldMap =>
  map.map((entry) => ({
    ...entry,
    form: Array.isArray(entry.form)
      ? entry.form.map((name) => prefix + capitalize(name))
      : prefix + capitalize(entry.form),
  }))

/** formData -> Salesforce-shaped object. Omits fields with no value. */
export const applyToSf = (map: FieldMap, formData: Data): Data => {
  const result: Data = {}
  for (const entry of map) {
    if (entry.readOnly) continue
    const codec = entry.codec ?? identity
    const input = Array.isArray(entry.form)
      ? entry.form.map((name) => formData[name])
      : formData[entry.form]
    const value = codec.toSf(input)
    if (value !== undefined) result[entry.sf] = value
  }
  return result
}

/** Salesforce-shaped object -> formData. The inverse of `applyToSf`. */
export const applyFromSf = (map: FieldMap, sfData: Data): Data => {
  const result: Data = {}
  for (const entry of map) {
    const codec = entry.codec ?? identity
    const value = codec.fromSf(sfData[entry.sf])
    if (Array.isArray(entry.form)) {
      // codecs for multi-field entries return a tuple in the same order
      const values = value as unknown[]
      entry.form.forEach((name, index) => {
        result[name] = values?.[index] ?? ""
      })
    } else {
      result[entry.form] = value
    }
  }
  return result
}
