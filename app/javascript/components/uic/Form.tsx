// Vendored from @bloom-housing/ui-components src/forms/Form.tsx
import React from "react"

interface FormProps {
  children: React.ReactNode
  id?: string
  className?: string
  onSubmit?: () => unknown
}

function onKeyPress(e: React.KeyboardEvent<HTMLElement>) {
  return e.key === "Enter" && !(e.target instanceof HTMLButtonElement) && e.preventDefault()
}

const Form = ({ id, children, className, onSubmit }: FormProps) => {
  return (
    // eslint-disable-next-line  jsx-a11y/no-noninteractive-element-interactions
    <form id={id} className={className} onSubmit={onSubmit} onKeyPress={onKeyPress} noValidate>
      {children}
    </form>
  )
}

export { Form as default, Form }
