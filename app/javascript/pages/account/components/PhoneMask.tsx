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

const digitsOf = (value: string) => value.replace(/\D/g, "")

// If `next` is `previous` with a single "-" removed, returns that separator's index
const removedSeparatorIndex = (previous: string, next: string) => {
  if (next.length !== previous.length - 1 || digitsOf(next) !== digitsOf(previous)) return null
  let index = 0
  while (index < next.length && next[index] === previous[index]) index++
  return previous[index] === "-" ? index : null
}

export const PhoneMask = React.forwardRef<HTMLInputElement, PhoneMaskProps>(
  ({ name, className, onChange, onFocus, ...rest }, ref) => {
    // Value as of the last change or focus, since react-hook-form can set it without an event
    const previousValueRef = React.useRef("")

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      previousValueRef.current = event.target.value
      onFocus?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      let raw = input.value
      let caret = input.selectionStart ?? raw.length

      // Deleting only a "-" would be undone by reformatting, so delete the neighboring digit too.
      // Handled here rather than on keydown because Android keyboards report key "Unidentified".
      const separatorIndex = removedSeparatorIndex(previousValueRef.current, raw)
      if (separatorIndex !== null) {
        const { inputType } = event.nativeEvent as InputEvent
        if (inputType?.endsWith("Forward")) {
          raw = raw.slice(0, separatorIndex) + raw.slice(separatorIndex + 1)
          caret = separatorIndex
        } else {
          raw = raw.slice(0, separatorIndex - 1) + raw.slice(separatorIndex)
          caret = separatorIndex - 1
        }
      }

      const digitsBeforeCaret = digitsOf(raw.slice(0, caret)).length
      const formatted = formatPhone(raw)
      if (formatted !== input.value) {
        input.value = formatted
        const nextCaret = caretAfterDigits(formatted, digitsBeforeCaret)
        input.setSelectionRange(nextCaret, nextCaret)
      }
      previousValueRef.current = formatted
      onChange?.(event)
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
        onFocus={handleFocus}
      />
    )
  }
)

PhoneMask.displayName = "PhoneMask"
