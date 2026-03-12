import React from "react"
import type { ComponentSchema } from "./formSchemas"

interface FormEngineProps {
  schema: ComponentSchema & Record<string, unknown>
  componentRegistry: Record<string, React.FC>
}

const RecursiveRenderer = ({ schema, componentRegistry }: FormEngineProps) => {
  if (!self || !self.crypto || typeof self.crypto.randomUUID !== "function") {
    console.error(self.crypto.randomUUID())
  }

  const ComponentToRender: React.FC = componentRegistry[schema.componentName]

  let children: React.ReactNode[] = []
  if (schema.children && schema.children.length > 0) {
    children = schema.children.map((childSchema) => (
      <RecursiveRenderer
        schema={childSchema}
        componentRegistry={componentRegistry}
        key={crypto.randomUUID()}
      />
    ))
  }
  // set key property to avoid weird behavior when navigating between form steps
  const props = { ...schema.props, key: crypto.randomUUID() }

  return React.createElement(ComponentToRender, props, ...children)
}

export default RecursiveRenderer
