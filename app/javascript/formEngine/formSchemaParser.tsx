import * as z from "zod"
import getFormComponentRegistry from "./formComponentRegistry"

const DataSchema = z.object({
  dataSource: z.enum(["listing", "form"]),
  key: z.string(),
})

// 
const NavigationSchema = z.object({
  showStepIfAnyPresent: z.optional(z.array(DataSchema)),
  hideStepIfAnyPresent: z.optional(z.array(DataSchema)),
  nextStep: z.optional(z.string()),
})

const ComponentSchema = z.object({
  componentName: z.string(),
  props: z.optional(z.record(z.string(), z.any())),
  // https://zod.dev/api#recursive-objects
  get children() {
    return z.optional(z.array(ComponentSchema))
  } 
})
export type ComponentSchema = z.infer<typeof ComponentSchema>

const PageComponentSchema = z.object({
	slug: z.string(),
  navigation: z.optional(NavigationSchema),
  componentType: z.literal("page"),
  ...ComponentSchema.shape
})
export type PageComponentSchema = z.infer<typeof PageComponentSchema>

export const FormSchema = z.object({
  formType: z.string(),
  // formType: z.enum(["listingApplication"]),
  formSubType: z.string(),
  // formSubType: z.enum(["defaultRental", "defaultSales"]),
  ...ComponentSchema.shape
})
export type FormSchema = z.infer<typeof FormSchema>

// find values by key in nested plain objects and arrays
const getNestedValuesByKey = (keyName: string, object: any, values: any[]): string[] => {
  if (object.constructor === Object) {
    for (const key of Object.keys(object)) {
      const val = object[key]
      if (key === keyName) {
        values.push(val)
      } else if (keyName !== "props") { // props objects may have arbitrary key names, ignore them
        getNestedValuesByKey(keyName, val, values)
      }
    }
  } else if (object instanceof Array) {
    for (const el of object) {
      getNestedValuesByKey(keyName, el, values)
    }
  }
  return values;
}

const getComponentNames = (schema: FormSchema): string[] => {
  return getNestedValuesByKey("componentName", schema, [])
}

// use to initiate react hook form initial state
const getFieldNames = (schema: FormSchema): string[] => {
  return getNestedValuesByKey("fieldNames", schema, [])
}

const getSectionNames = (schema: FormSchema): string[] => {
  return getNestedValuesByKey("section", schema, [])
}

export const parseFormSchema = (schema: FormSchema) => {
  try {
    FormSchema.parse(schema)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed: ", error.issues[0])
    } else {
      console.error("Unexpected error: ", error)
      return
    }
  }

  const schemaComponentNames = getComponentNames(schema)
  const registeredComponentNames = Object.keys(getFormComponentRegistry())
  const invalidComponentNames = schemaComponentNames.filter((el) => !registeredComponentNames.includes(el))
  if (invalidComponentNames.length > 0) {
    console.error("Invalid component names: ", invalidComponentNames)
    return
  }

  return schema
}
