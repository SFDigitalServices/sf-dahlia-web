// Vendored from @bloom-housing/ui-components src/forms/PhoneMask.tsx,
// reimplemented without react-text-mask (unmaintained). Formats US phone
// numbers as (123) 456-7890 while typing, matching the original mask's
// guide={false} behavior: punctuation appears as digits are entered.
import React from "react"

export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PhoneMask = React.forwardRef((props: any, ref: any) => {
  const { value, onChange, name, disabled, placeholder } = props

  return (
    <input
      className="input"
      type="tel"
      placeholder={placeholder ?? ""}
      id={name}
      value={value}
      name={name}
      disabled={disabled}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        e.target.value = formatPhoneNumber(e.target.value)
        onChange(e)
      }}
      ref={ref}
      aria-labelledby={"phone-label"}
    />
  )
})

PhoneMask.displayName = "PhoneMask"
