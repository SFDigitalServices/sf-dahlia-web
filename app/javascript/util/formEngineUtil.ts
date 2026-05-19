import type { DataSchema, StepInfoSchema } from "../formEngine/formSchemas"
import dayjs, { type Dayjs } from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { t } from "@bloom-housing/ui-components"

export const translationFromDataSchema = (
  translationKey: string,
  translationVarsData: Record<string, DataSchema>,
  staticData: Record<string, unknown>,
  formData: Record<string, unknown>
): string => {
  if (!translationVarsData) return t(translationKey)

  const translationVars = {}
  const dataSources = { ...staticData, form: formData }
  for (const [varName, data] of Object.entries(translationVarsData)) {
    const { dataSource, dataKey } = data
    translationVars[varName] = dataSources[dataSource][dataKey]
  }
  return t(translationKey, translationVars)
}

export const showStep = (
  operation: string,
  conditions: DataSchema[],
  dataSources: Record<string, unknown>
): boolean => {
  const processedConditions = conditions.map((condition) => {
    const value = dataSources[condition.dataSource][condition.dataKey]
    const processedCondition = condition.dataValueToMatch
      ? condition.dataValueToMatch === value
      : value
    return condition.negate ? !processedCondition : !!processedCondition
  })
  if (operation === "showStepIfAllPresent") {
    return processedConditions.every(Boolean)
  }
  if (operation === "showStepIfAnyPresent") {
    return processedConditions.some(Boolean)
  }
  if (operation === "hideStepIfAllPresent") {
    return !processedConditions.every(Boolean)
  }
  if (operation === "hideStepIfAnyPresent") {
    return !processedConditions.some(Boolean)
  }
  return true
}

export const calculateNextStep = (
  currentStepIndex: number,
  stepInfoMap: StepInfoSchema[],
  staticData: Record<string, unknown>,
  formData: Record<string, unknown>
): number => {
  const nextStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.nextStep
  if (nextStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === nextStepSlug)
  }
  const dataSources = { ...staticData, form: formData }

  for (const [idx, step] of stepInfoMap.entries()) {
    if (idx <= currentStepIndex) continue
    if (!step.navigationArrival) return idx
    if (step.navigationArrival) {
      const [operation, conditions] = Object.entries(step.navigationArrival)[0]
      if (showStep(operation, conditions, dataSources)) return idx
    }
  }
  return stepInfoMap.length - 1
}

export const calculatePrevStep = (
  currentStepIndex: number,
  stepInfoMap: StepInfoSchema[],
  staticData: Record<string, unknown>,
  formData: Record<string, unknown>
): number => {
  const prevStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.prevStep
  if (prevStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === prevStepSlug)
  }
  const dataSources = { ...staticData, form: formData }

  for (let i = currentStepIndex - 1; i >= 0; i--) {
    const step = stepInfoMap[i]
    if (!step.navigationArrival) {
      return i
    }
    if (step.navigationArrival) {
      const [operation, conditions] = Object.entries(step.navigationArrival)[0]
      if (showStep(operation, conditions, dataSources)) {
        return i
      }
    }
  }
  return 0
}

export const validDayRange = (value: string): boolean =>
  Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 31

export const validMonthRange = (value: string): boolean =>
  Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 12

export const validYearRange = (value: string): boolean =>
  Number.parseInt(value, 10) >= 1900 && Number.parseInt(value, 10) <= dayjs().year() + 1

export const parseDate = (year: string, month: string, day: string): Dayjs => {
  dayjs.extend(customParseFormat)
  return dayjs(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`, "YYYY-MM-DD", true)
}

// use to handle leap years and months with less than 31 days
export const validDate = (
  birthYearValue: string,
  birthMonthValue: string,
  birthDayValue: string
): boolean => {
  if (!birthDayValue || !birthMonthValue || !birthYearValue) return true
  return parseDate(birthYearValue, birthMonthValue, birthDayValue).isValid()
}

export const getFullName = (person: {
  firstName: string
  middleName: string
  lastName: string
}) => {
  return `${person.firstName || ""} ${person.middleName || ""} ${person.lastName || ""}`
}

export const updateFormPath = (newStepIndex: number, stepInfoMap: StepInfoSchema[]) => {
  const currentPath = window.location.pathname
  const paths = currentPath.split("/")
  const slug = stepInfoMap[newStepIndex].slug
  paths[paths.length - 1] = slug
  const newPath = paths.join("/")
  window.history.pushState({}, "", newPath)
}

export const getFormattedAddress = (address: {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
}) => {
  const streets = [address.street1, address.street2].filter(Boolean).join(" ")
  const cityStateZip = [address.city, address.state, address.zip].filter(Boolean).join(", ")
  return { streets, cityStateZip }
}

export const getAddressErrorEmailLink = (
  data: Record<string, unknown>,
  staticData: Record<string, unknown>,
  formData: Record<string, unknown>
) => {
  const formattedAddress = getFormattedAddress({
    street1: formData["primaryApplicantAddressStreet"] as string,
    street2: formData["primaryApplicantAddressAptOrUnit"] as string,
    city: formData["primaryApplicantAddressCity"] as string,
    state: formData["primaryApplicantAddressState"] as string,
    zip: formData["primaryApplicantAddressZipcode"] as string,
  })
  const mailParams = {
    subject: `[Invalid Address Error] ${t("error.addressValidation.notFoundSubject")}`,
    body: t("error.addressValidation.notFoundBody", {
      listing_name: (staticData["listing"] as { Name?: string })?.Name,
      home_address: formattedAddress.streets + ", " + formattedAddress.cityStateZip,
      first_name: (formData["primaryApplicantFirstName"] as string) || "",
      last_name: (formData["primaryApplicantLastName"] as string) || "",
      email: (formData["primaryApplicantEmail"] as string) || "",
      phone_number: (formData["primaryApplicantPhone"] as string) || "",
    }),
  }
  return Object.entries(mailParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")
}

export const addressesMatch = (
  address1: Record<string, string>,
  address2: Record<string, string>
) => {
  return (
    address1.street1 === address2.street1 &&
    address1.street2 === address2.street2 &&
    address1.city === address2.city &&
    address1.state === address2.state &&
    address1.zip === address2.zip
  )
}

export const stateOptions = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District Of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

export const numChildrenUnderSix = (householdMembers: Record<string, unknown>[]) => {
  return householdMembers.filter((member) => {
    if (!member.birthYear || !member.birthMonth || !member.birthDay) return false
    const memberBirthdate = new Date(
      member.birthYear as number,
      (member.birthMonth as number) - 1,
      member.birthDay as number
    )
    return memberBirthdate > new Date()
  })
}
