import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { DataSchema } from "../formEngine/formSchemas"
import { t } from "@bloom-housing/ui-components"

const getData = (
  data: DataSchema,
  formData: Record<string, unknown>,
  listingData: RailsListing
) => {
  const { dataSource, dataKey } = data
  return { form: formData, listing: listingData }[dataSource][dataKey]
}

// formData.primaryApplicantFirstName === "Jane"
// { name: { dataSource: "form", key: "primaryApplicantFirstName" } } -> { name: "Jane" }
export const translationFromDataSchema = (
  translationKey: string,
  translationVarsData: Record<string, DataSchema>,
  dataSources: { formData: Record<string, unknown>; listingData: RailsListing }
): string => {
  if (!translationVarsData) return t(translationKey)

  const { formData, listingData } = dataSources
  const translationVars = {}
  for (const [varName, data] of Object.entries(translationVarsData)) {
    translationVars[varName] = getData(data, formData, listingData)
  }
  return t(translationKey, translationVars)
}
