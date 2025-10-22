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
    children = schema.children.map((childSchema) => (
      <RecursiveRenderer schema={childSchema} key={crypto.randomUUID()} />
    ))
  }
  // set key property to avoid weird behavior when navigating between form steps
  const props = { ...schema.props, key: crypto.randomUUID() }

  return React.createElement(ComponentToRender, props, ...children)
}

export default RecursiveRenderer
