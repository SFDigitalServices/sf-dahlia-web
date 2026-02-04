import type { DataSchema, StepInfoSchema } from "../formEngine/formSchemas"
import type { DataSources } from "../formEngine/formEngineContext"
import dayjs, { type Dayjs } from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { t } from "@bloom-housing/ui-components"
import { type SeniorBuildingAgeRequirement } from "./listingUtil"

export const translationFromDataSchema = (
  translationKey: string,
  translationVarsData: Record<string, DataSchema>,
  dataSources: DataSources
): string => {
  if (!translationVarsData) return t(translationKey)

  const translationVars = {}
  for (const [varName, data] of Object.entries(translationVarsData)) {
    const { dataSource, dataKey } = data
    translationVars[varName] = dataSources[dataSource][dataKey]
  }
  return t(translationKey, translationVars)
}

export const showStep = (
  operation: string,
  conditions: DataSchema[],
  dataSources: DataSources
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
  dataSources: DataSources
): number => {
  const nextStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.nextStep
  if (nextStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === nextStepSlug)
  }

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
  dataSources: DataSources
): number => {
  const prevStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.prevStep
  if (prevStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === prevStepSlug)
  }

  const reversedCurrentStepIndex = stepInfoMap.length - 1 - currentStepIndex
  for (const [idx, step] of stepInfoMap.reverse().entries()) {
    if (idx <= reversedCurrentStepIndex) continue
    if (!step.navigationArrival) return stepInfoMap.length - 1 - idx
    if (step.navigationArrival) {
      const [operation, conditions] = Object.entries(step.navigationArrival)[0]
      if (showStep(operation, conditions, dataSources)) return stepInfoMap.length - 1 - idx
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

export const validAge = (
  birthDate: Dayjs,
  minimumAge: number | null,
  seniorBuildingAgeRequirement?: SeniorBuildingAgeRequirement
): boolean => {
  if (seniorBuildingAgeRequirement?.entireHousehold) {
    return dayjs().diff(birthDate, "year") >= seniorBuildingAgeRequirement.minimumAge
  }
  if (minimumAge) {
    return dayjs().diff(birthDate, "year") >= minimumAge
  }
  // "unborn baby" rule
  return dayjs().diff(birthDate, "month") > -10
}

export const getPrimaryApplicantData = (formData: Record<string, unknown>) => {
  return {
    firstName: formData.primaryApplicantFirstName as string,
    middleName: formData.primaryApplicantMiddleName as string,
    lastName: formData.primaryApplicantLastName as string,
    dob: (formData.primaryApplicantDob as string) || "1990-01-01", // TODO: update after DAH-3543
  }
}
