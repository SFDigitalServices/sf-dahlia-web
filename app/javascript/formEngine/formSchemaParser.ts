import * as z from "zod"
import getFormComponentRegistry from "./formComponentRegistry"

const DataSchema = z.object({
  dataSource: z.enum(["listing", "form"]),
  dataKey: z.string(),
})
export type DataSchema = z.infer<typeof DataSchema>

const NavigationSchema = z.object({
  showStepIfAnyPresent: z.optional(z.array(DataSchema)),
  hideStepIfAnyPresent: z.optional(z.array(DataSchema)),
  nextStep: z.optional(z.string()),
})

const ComponentSchema = z.object({
  componentType: z.optional(z.string()),
  componentName: z.string(),
  props: z.optional(z.record(z.string(), z.any())),
  // https://zod.dev/api#recursive-objects
  get children() {
    return z.optional(z.array(ComponentSchema))
  },
})
export type ComponentSchema = z.infer<typeof ComponentSchema>

const StepInfoSchema = z.object({
  slug: z.string(),
  sectionName: z.optional(z.string()),
  hideLayout: z.optional(z.boolean()),
  navigation: z.optional(NavigationSchema),
  fieldNames: z.optional(z.array(z.string())),
})
export type StepInfoSchema = z.infer<typeof StepInfoSchema>

const StepComponentSchema = z.object({
  stepInfo: StepInfoSchema,
  componentType: z.string(),
  ...ComponentSchema.shape,
})
export type StepComponentSchema = z.infer<typeof StepComponentSchema>

export const FormSchema = z.object({
  formType: z.string(), // "listingApplication"
  formSubType: z.string(), // "defaultRental", "defaultSales"
  componentType: z.string(),
  componentName: z.string(),
  props: z.optional(z.record(z.string(), z.any())),
  children: z.array(StepComponentSchema),
})
export type FormSchema = z.infer<typeof FormSchema>

// find values by key in nested plain objects and arrays
const getNestedValuesByKey = (keyName: string, object: any, values: any[]): string[] => {
  if (object?.constructor === Object) {
    for (const key of Object.keys(object)) {
      const val = object[key]
      if (key === keyName) {
        values.push(val)
      } else {
        getNestedValuesByKey(keyName, val, values)
      }
    }
  } else if (Array.isArray(object)) {
    for (const el of object) {
      getNestedValuesByKey(keyName, el, values)
    }
  }
  return values
}

const getComponentNames = (schema: FormSchema): string[] => {
  return getNestedValuesByKey("componentName", schema, [])
}

// use to initiate react hook form initial state
export const getFieldNames = (schema: any): string[] => {
  const fieldNameGroups = getNestedValuesByKey("fieldNames", schema, [])
  return Object.values(Object.assign({}, ...fieldNameGroups))
}

const getSectionNames = (schema: FormSchema | StepComponentSchema): string[] => {
  return getNestedValuesByKey("sectionName", schema, [])
}

export const generateSectionNames = (schema: FormSchema): string[] => {
  // remove duplicates
  return getSectionNames(schema).filter((val, idx, ary) => ary.indexOf(val) === idx)
}

export const generateInitialFormData = (schema: FormSchema): Record<string, null> => {
  return getFieldNames(schema).reduce((acc, fieldName) => {
    acc[fieldName] = null
    return acc
  }, {})
}

export const parseFormSchema = (schema: FormSchema): FormSchema => {
  let parsedSchema
  try {
    parsedSchema = FormSchema.parse(schema)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed:", error.issues[0])
    } else {
      console.error("Unexpected error:", error)
      return
    }
  }

  const schemaComponentNames = getComponentNames(schema)
  const registeredComponentNames = Object.keys(getFormComponentRegistry())
  const invalidComponentNames = schemaComponentNames.filter(
    (el) => !registeredComponentNames.includes(el)
  )
  if (invalidComponentNames.length > 0) {
    console.error("Invalid component names:", invalidComponentNames)
    return
  }

  return parsedSchema
}
