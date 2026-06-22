import React from "react"
import MaskedInput from "react-text-mask"

const PHONE_MASK = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]

type PhoneMaskProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  name: string
}

export const PhoneMask = React.forwardRef<HTMLInputElement, PhoneMaskProps>(
  ({ name, className, ...rest }, ref) => {
    return (
      <MaskedInput
        {...rest}
        mask={PHONE_MASK}
        className={["input", className].filter(Boolean).join(" ")}
        type="tel"
        guide={false}
        id={name}
        name={name}
        render={(textMaskRef, inputProps) => (
          <input
            {...inputProps}
            ref={(node) => {
              textMaskRef(node)
              if (typeof ref === "function") {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
          />
        )}
      />
    )
  }
)

PhoneMask.displayName = "PhoneMask"
