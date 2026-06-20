import React from "react"
import MaskedInput from "react-text-mask"

const PHONE_MASK = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PhoneMask = React.forwardRef((props: any, ref: any) => {
  const { value, onChange, onBlur, name, disabled } = props

  return (
    <MaskedInput
      mask={PHONE_MASK}
      className="input"
      type="tel"
      guide={false}
      id={name}
      name={name}
      disabled={disabled}
      value={value}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => {
        e.persist()
        onChange?.(e)
      }}
      onBlur={onBlur}
      render={(textMaskRef, inputProps) => (
        <input
          {...inputProps}
          ref={(node) => {
            textMaskRef(node)
            typeof ref === "function" && ref(node)
          }}
          aria-labelledby="phone-label"
        />
      )}
    />
  )
})
