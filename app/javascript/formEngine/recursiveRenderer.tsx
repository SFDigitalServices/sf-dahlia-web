import React from "react"
import type { ComponentSchema } from "./formSchemas"
import getFormComponentRegistry from "./formComponentRegistry"

interface FormEngineProps {
  schema: ComponentSchema & Record<string, unknown>
}
const componentRegistry = getFormComponentRegistry()

const RecursiveRenderer = ({ schema }: FormEngineProps) => {
  if (!self || !self.crypto || typeof self.crypto.randomUUID !== "function") {
    console.error(self.crypto.randomUUID())
  }

  const ComponentToRender: React.FC = componentRegistry[schema.componentName]

  let children: React.ReactNode[] = []
  if (schema.children && schema.children.length > 0) {
    children = schema.children.map((childSchema, index) => (
      <RecursiveRenderer
        schema={childSchema}
        key={`${schema.componentName}-${childSchema.componentName}-${index}`}
      />
    ))
  }
  const props = { ...schema.props, key: `${schema.componentName}-${JSON.stringify(schema.props)}` }

  return React.createElement(ComponentToRender, props, ...children)
}

export default RecursiveRenderer
