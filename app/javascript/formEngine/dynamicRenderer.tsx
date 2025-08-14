import React from "react"
import type { FormSchema, PageComponentSchema, ComponentSchema} from "./formSchemaParser"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import ListingApplyFormLayout from "../layouts/ListingApplyFormLayout"
import getFormComponentRegistry from "./formComponentRegistry"

interface FormEngineProps {
  listing: RailsListing
  schema: FormSchema | PageComponentSchema | ComponentSchema
}

const componentRegistry = getFormComponentRegistry()

const DynamicRenderer = ({ listing, schema }: FormEngineProps) => {
  const ComponentToRender = componentRegistry[schema.componentName]

  let children = []
  if (schema.children && schema.children.length > 0) {
    children = schema.children.map((childSchema) => <DynamicRenderer listing={listing} schema={childSchema} />)
  }

  let props = schema.props
  if (schema.componentName === 'ListingApplyFormLayout' || schema.componentName === 'ListingApplyIntro') {
    props = { ...props, listing }
  console.log('schema.componentName', schema.componentName)
  console.log('props', props)

  }

  // const renderChildren = (children: (PageComponentSchema | ComponentSchema)[]): React.ReactNode => {
  //   schema.children.map((childSchema) => <DynamicRenderer schema={childSchema}
  // }

   return React.createElement(
    ComponentToRender,
    props,
    ...children
  )

}

export default DynamicRenderer
