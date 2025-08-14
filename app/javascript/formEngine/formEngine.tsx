import React from "react"
import type { FormSchema } from "./formSchemaParser"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import ListingApplyFormLayout from "../layouts/ListingApplyFormLayout"
import DynamicRenderer from "./dynamicRenderer"

interface FormEngineProps {
  listing: RailsListing
  schema: FormSchema
}

const FormEngine = ({ listing, schema }: FormEngineProps) => {
  // TODO: set up page navigation

  if (schema.formType === "listingApplication") {
    return (
      <DynamicRenderer listing={listing} schema={schema} />
    )
  }
}

export default FormEngine
