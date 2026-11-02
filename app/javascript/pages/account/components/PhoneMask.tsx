import React from "react"
import { MaskedInput } from "react-text-mask-modern"

const PHONE_MASK = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]

type PhoneMaskProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  name: string
  value?: string | number
}

export const PhoneMask = React.forwardRef<HTMLInputElement, PhoneMaskProps>(
  ({ name, className, ...rest }, ref) => {
    return (
      <MaskedInput
        {...rest}
        ref={ref}
        mask={PHONE_MASK}
        className={["input", className].filter(Boolean).join(" ")}
        type="tel"
        guide={false}
        id={name}
        name={name}
      />
    )
  }
)

PhoneMask.displayName = "PhoneMask"
