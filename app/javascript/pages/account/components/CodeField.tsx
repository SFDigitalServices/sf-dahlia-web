import React, { useRef } from "react"
import { ErrorMessage, Field, t } from "@bloom-housing/ui-components"
import Fieldset from "./Fieldset"
import styles from "./CodeField.module.scss"

const CodeField = ({
  value = "",
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: boolean
}) => {
  const code = value.replace(/\D/g, "").slice(0, 6)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const focusInput = (index: number) => inputsRef.current[index]?.focus()

  return (
    <Fieldset label={t("createAccount.enterCode")} hasError={error}>
      <div className={styles.codeGroup}>
        {Array.from({ length: 6 }, (_, i) => (
          <Field
            key={i}
            id={`code-${i + 1}`}
            name={`code-${i + 1}`}
            className={styles.codeInput}
            label={`${i + 1}`}
            readerOnly
            error={error}
            describedBy={error ? "code-error" : undefined}
            // Accept one digit or a 6-digit paste
            onChange={({ target }) => {
              const digits = target.value.replace(/\D/g, "").slice(0, 6)
              if (digits.length === 6) {
                onChange(digits)
                focusInput(5)
              } else if (digits.length === 1 && i === Math.min(code.length, 5)) {
                onChange(code.slice(0, i) + digits)
                focusInput(Math.min(i + 1, 5))
              }
            }}
            inputProps={{
              ref: (element: HTMLInputElement | null) => {
                inputsRef.current[i] = element
              },
              value: code[i] ?? "",
              inputMode: "numeric",
              maxLength: 6,
              // Remove code on backspace and move focus back
              onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key !== "Backspace" || !code) return
                event.preventDefault()
                onChange(code.slice(0, -1))
                focusInput(Math.max(code.length - 1, 0))
              },
              onFocus: (event: React.FocusEvent<HTMLInputElement>) => event.target.select(),
            }}
          />
        ))}
      </div>
      <ErrorMessage id="code-error" error={error}>
        {t("createAccount.codeInvalid.p1")}
        <br />
        {t("createAccount.codeInvalid.p2")}
      </ErrorMessage>
    </Fieldset>
  )
}

export default CodeField
