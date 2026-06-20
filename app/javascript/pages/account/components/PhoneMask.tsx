import React from "react"
import MaskedInput from "react-text-mask"

const PHONE_MASK = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PhoneMask = React.forwardRef((props: any, ref: any) => {
  const { value, onChange, name, disabled } = props

  return (
    <MaskedInput
      mask={PHONE_MASK}
      className="input"
      type="tel"
      guide={false}
      id={name}
      value={value}
      name={name}
      disabled={disabled}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => {
        e.persist()
        onChange(e)
      }}
      ref={ref}
      aria-labelledby={"phone-label"}
    />
  )
})
