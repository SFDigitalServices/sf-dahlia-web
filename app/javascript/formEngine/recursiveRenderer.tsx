import React from "react"
import type { FormSchema, StepComponentSchema, ComponentSchema } from "./formSchemaParser"
import getFormComponentRegistry from "./formComponentRegistry"
import { v4 as uuidv4 } from "uuid"

interface FormEngineProps {
  schema: FormSchema | StepComponentSchema | ComponentSchema
}

const componentRegistry = getFormComponentRegistry()

const RecursiveRenderer = ({ schema }: FormEngineProps) => {
  const ComponentToRender = componentRegistry[schema.componentName]

  let children = []
  if (schema.children && schema.children.length > 0) {
    children = schema.children.map((childSchema) => <RecursiveRenderer schema={childSchema} />)
  }

  // set key property to avoid weird behavior when navigating between form steps
  const props = { ...schema.props, key: uuidv4() }

  return React.createElement(ComponentToRender, props, ...children)
}

export default RecursiveRenderer
