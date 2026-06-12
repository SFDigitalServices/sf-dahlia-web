/* eslint-disable @typescript-eslint/no-unsafe-argument --
 * react-hook-form v6 getValues/e.target.value are typed any; kept as the
 * package wrote them to avoid behavior drift. */
// Vendored from @bloom-housing/ui-components src/forms/Field.tsx
import React, { ChangeEvent, useMemo } from "react"
import { ErrorMessage } from "./ErrorMessage"
import { UseFormMethods, RegisterOptions } from "react-hook-form"
import { httpsRegex, urlRegex } from "./validators"

export interface FieldProps {
  error?: boolean
  errorMessage?: string | JSX.Element
  className?: string
  controlClassName?: string
  caps?: boolean
  primary?: boolean
  readerOnly?: boolean
  type?: string
  id?: string
  name: string
  note?: string | JSX.Element
  subNote?: string
  label?: string | React.ReactNode
  defaultValue?: string | number
  onDrop?: (e: React.DragEvent<HTMLElement>) => boolean
  onPaste?: (e: React.ClipboardEvent) => boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  register?: UseFormMethods["register"]
  validation?: RegisterOptions
  disabled?: boolean
  prepend?: string
  inputProps?: Record<string, unknown>
  describedBy?: string
  ariaLabel?: string
  getValues?: UseFormMethods["getValues"]
  setValue?: UseFormMethods["setValue"]
  dataTestId?: string
  hidden?: boolean
  labelClassName?: string
  bordered?: boolean
  postInputContent?: JSX.Element
}

const Field = (props: FieldProps) => {
  const classes = ["field"]
  if (props.error) {
    classes.push("error")
  }

  if (props.className) {
    classes.push(props.className)
  }

  const controlClasses = []

  if (props.type !== "checkbox") {
    controlClasses.push("control")
  }

  if (props.controlClassName) {
    controlClasses.push(props.controlClassName)
  }

  if (props.bordered && (props.type === "radio" || props.type === "checkbox"))
    controlClasses.push("field-border")

  const formatValue = (focused = false) => {
    if (props.getValues && props.setValue) {
      const currencyValue = props.getValues(props.name)
      const numericIncome = Number.parseFloat(currencyValue)

      if (focused && currencyValue) {
        props.setValue(props.name, Number.parseFloat(currencyValue.replaceAll(",", "")))
      } else if (Number.isNaN(numericIncome)) {
        props.setValue(props.name, "")
      } else {
        props.setValue(
          props.name,
          numericIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })
        )
      }
    }
  }

  const filterNumbers = (e: ChangeEvent<HTMLInputElement>) => {
    if (props.setValue) {
      props.setValue(props.name, e.target.value.replace(/[a-z]|[A-Z]/g, "").match(/^\d*\.?\d?\d?/g))
    }
  }

  let inputProps = { ...props.inputProps }
  if (props.type === "currency") {
    const customOnBlur =
      typeof inputProps.onBlur === "function"
        ? (inputProps.onBlur as () => void)
        : () => {
            //noop
          }
    const customOnFocus =
      typeof inputProps.onFocus === "function"
        ? (inputProps.onFocus as () => void)
        : () => {
            //noop
          }
    inputProps = {
      ...inputProps,
      onBlur: () => {
        formatValue()
        customOnBlur()
      },
      onFocus: () => {
        formatValue(true)
        customOnFocus()
      },
      onChange: filterNumbers,
    }
  }

  if (props.type === "url") {
    inputProps = {
      ...inputProps,
      ref:
        props.register &&
        props.register({
          ...props.validation,
          validate: {
            https: (value) => {
              if (!value?.length) return true
              return httpsRegex.test(value)
            },
            invalid: (value) => {
              if (!value?.length) return true
              return urlRegex.test(value)
            },
            ...props.validation?.validate,
          },
        }),
    }
  }

  const type = (props.type === "currency" && "text") || props.type || "text"
  const isRadioOrCheckbox = ["radio", "checkbox"].includes(type)

  const label = useMemo(() => {
    const labelClasses = ["label"]
    if (props.caps) labelClasses.push("text__caps-spaced")
    if (props.primary) labelClasses.push("text-primary")
    if (props.readerOnly) labelClasses.push("sr-only")
    if (props.labelClassName) labelClasses.push(props.labelClassName)
    if (props.type === "radio") {
      labelClasses.push("font-semibold")
    }
    if (props.error) labelClasses.push("text-alert")

    return (
      <label className={labelClasses.join(" ")} htmlFor={props.id || props.name}>
        {props.label}
      </label>
    )
  }, [
    props.caps,
    props.primary,
    props.readerOnly,
    props.labelClassName,
    props.type,
    props.id,
    props.name,
    props.label,
    props.error,
  ])

  const idOrName = props.id || props.name

  let note = <></>
  if (props.note) {
    note = <p className="field-note mb-4">{props.note}</p>
  }

  return (
    <div className={classes.join(" ")}>
      {!isRadioOrCheckbox && !props.hidden && label}
      {note}
      <div className={controlClasses.join(" ")}>
        {props.prepend && <span className="prepend">{props.prepend}</span>}
        <input
          aria-describedby={props.describedBy || `${idOrName}-error`}
          aria-invalid={!!props.error || false}
          aria-label={props.ariaLabel}
          className="input"
          type={type}
          id={idOrName}
          name={props.name}
          defaultValue={props.defaultValue}
          placeholder={props.placeholder}
          ref={props.register && props.register(props.validation)}
          disabled={props.disabled}
          onPaste={props.onPaste}
          onDrop={props.onDrop}
          onChange={props.onChange}
          data-testid={props.dataTestId}
          {...inputProps}
          hidden={props.hidden}
        />
        {props.postInputContent}
        {isRadioOrCheckbox && label}
      </div>
      {props.subNote && <p className="field-sub-note">{props.subNote}</p>}
      {props.errorMessage ? (
        <ErrorMessage id={`${idOrName}-error`} error={props.error}>
          {props.errorMessage}
        </ErrorMessage>
      ) : (
        <span id={`${idOrName}-error`} />
      )}
    </div>
  )
}

export { Field as default, Field }
