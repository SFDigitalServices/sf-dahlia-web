import React, { useRef } from "react"
import { ErrorMessage, Field, t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import Fieldset from "./Fieldset"
import styles from "./VerificationCodeField.module.scss"

export type CodeErrorType = "invalid" | "expired"

const codeErrorMessages: Record<
  CodeErrorType,
  (onGetNewCode?: () => void, getNewCodeDisabled?: boolean) => React.ReactNode
> = {
  invalid: () => (
    <>
      {t("createAccount.codeInvalid.p1")}
      <br />
      {t("createAccount.codeInvalid.p2")}
    </>
  ),
  expired: (onGetNewCode, getNewCodeDisabled) => (
    <>
      {t("createAccount.codeExpired")}{" "}
      <Button
        variant="text"
        size="sm"
        type="button"
        disabled={getNewCodeDisabled}
        onClick={onGetNewCode}
      >
        {t("createAccount.getNewCode")}
      </Button>
    </>
  ),
}

const VerificationCodeField = ({
  value = "",
  onChange,
  error,
  errorType,
  onGetNewCode,
  getNewCodeDisabled,
}: {
  value: string
  onChange: (value: string) => void
  error?: boolean
  errorType?: CodeErrorType
  onGetNewCode?: () => void
  getNewCodeDisabled?: boolean
}) => {
  const renderErrorMessage = codeErrorMessages[errorType] ?? codeErrorMessages.invalid

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
                if (event.key === "Enter") {
                  event.preventDefault()
                  ;(event.currentTarget as HTMLElement).closest("form")?.requestSubmit()
                  return
                }
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
        {renderErrorMessage(onGetNewCode, getNewCodeDisabled)}
      </ErrorMessage>
    </Fieldset>
  )
}

export default VerificationCodeField
