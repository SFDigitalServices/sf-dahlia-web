import React from "react"

const MAX_DIGITS = 10

type PhoneMaskProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  name: string
}

// Formats as 415-555-1234, only adding a separator once a digit follows it so backspace isn't blocked
export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, MAX_DIGITS)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join("-")
}

// Returns the index in `formatted` just after the `digitCount`-th digit
const caretAfterDigits = (formatted: string, digitCount: number) => {
  if (digitCount <= 0) return 0
  let seen = 0
  for (const [index, char] of [...formatted].entries()) {
    if (/\d/.test(char) && ++seen === digitCount) return index + 1
  }
  return formatted.length
}

export const PhoneMask = React.forwardRef<HTMLInputElement, PhoneMaskProps>(
  ({ name, className, onChange, onKeyDown, ...rest }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      const caret = input.selectionStart ?? input.value.length
      const digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, "").length
      const formatted = formatPhone(input.value)
      if (formatted !== input.value) {
        input.value = formatted
        const nextCaret = caretAfterDigits(formatted, digitsBeforeCaret)
        input.setSelectionRange(nextCaret, nextCaret)
      }
      onChange?.(event)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const input = event.currentTarget
      const { selectionStart, selectionEnd } = input
      // Backspacing over a separator would be undone by reformatting, so step the caret past it
      // and let the default action delete the preceding digit instead
      if (
        event.key === "Backspace" &&
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        selectionStart > 1 &&
        input.value[selectionStart - 1] === "-"
      ) {
        input.setSelectionRange(selectionStart - 1, selectionStart - 1)
      }
      onKeyDown?.(event)
    }

    return (
      <input
        {...rest}
        ref={ref}
        className={["input", className].filter(Boolean).join(" ")}
        type="tel"
        id={name}
        name={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }
)

PhoneMask.displayName = "PhoneMask"
