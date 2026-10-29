import React from "react"
import { FieldProps } from "@bloom-housing/ui-components"

export type TextFieldProps = Pick<
  FieldProps,
  | "name"
  | "label"
  | "labelClassName"
  | "className"
  | "validation"
  | "register"
  | "error"
  | "errorMessage"
  | "describedBy"
> & {
  type?: React.HTMLInputTypeAttribute
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "type">
  dataTestId?: string
}

const TextField = ({ type = "text", inputProps, dataTestId, ...props }: TextFieldProps) => {
  const errorId = `${props.name}-error`

  return (
    <div className={`field ${props.error ? "error" : ""} ${props.className || ""}`}>
      <label
        className={`label ${props.error ? "text-alert" : ""} ${props.labelClassName || ""}`}
        htmlFor={props.name}
      >
        {props.label}
      </label>
      <div className="control">
        <input
          id={props.name}
          name={props.name}
          type={type}
          className="input"
          aria-describedby={[props.describedBy, errorId].filter(Boolean).join(" ")}
          aria-invalid={!!props.error}
          ref={props.register && props.register(props.validation)}
          data-testid={dataTestId}
          {...inputProps}
        />
      </div>
      <span id={errorId} className="error-message" aria-live="assertive">
        {props.error && props.errorMessage}
      </span>
    </div>
  )
}

export default TextField
