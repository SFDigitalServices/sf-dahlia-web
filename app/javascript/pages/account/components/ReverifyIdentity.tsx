import React, { useEffect, useRef, useState } from "react"
import { ErrorMessage, Field, t } from "@bloom-housing/ui-components"
import { Alert, Button } from "@bloom-housing/ui-seeds"

import {
  ReverificationMethod,
  ReverificationPrompt,
} from "../../../authentication/session/useReverificationPrompt"
import VerificationCodeField from "./VerificationCodeField"
import styles from "./ReverifyIdentity.module.scss"

type ReverifyError = "code" | "password" | "generic" | null

/**
 * Stands in for a page's form while a sensitive action waits on the user confirming it's them.
 * Renders in the page's own card rather than a modal, so the page keeps its layout and the
 * paused form stays mounted underneath with whatever the user had entered.
 */
const ReverifyIdentity = ({ prompt }: { prompt: ReverificationPrompt }) => {
  const [method, setMethod] = useState<ReverificationMethod | undefined>(prompt.methods[0])
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<ReverifyError>(prompt.methods.length > 0 ? null : "generic")
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The form the user submitted was just swapped out, so tell them where they are.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const otherMethod = prompt.methods.find((candidate) => candidate !== method)

  const sendCode = async () => {
    setError(null)
    const { error: sendError } = await prompt.sendEmailCode()
    if (sendError) {
      setError("generic")
      return
    }
    setCodeSent(true)
  }

  const onSubmit = async () => {
    setError(null)
    const { error: verifyError } =
      method === "password"
        ? await prompt.verifyPassword(password)
        : await prompt.verifyEmailCode(verificationCode)
    if (verifyError) setError(method === "password" ? "password" : "code")
  }

  return (
    <div className={styles.reverify}>
      {/* A plain h1 because the seeds Heading doesn't forward a ref to focus. */}
      <h1 className="text-heading-2xl" ref={headingRef} tabIndex={-1}>
        {t("reverify.title")}
      </h1>
      <p>{t("reverify.description")}</p>

      {error === "generic" && (
        <Alert variant="alert" fullwidth className={styles.alert}>
          {t("error.account.genericServerError")}
        </Alert>
      )}

      {method === "emailCode" && !codeSent && (
        <>
          <p>{t("reverify.sendCodeTo", { email: prompt.emailAddress ?? "" })}</p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={prompt.isBusy}
              onClick={() => {
                void sendCode()
              }}
            >
              {t("reverify.sendCode")}
            </Button>
          </div>
        </>
      )}

      {((method === "emailCode" && codeSent) || method === "password") && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit()
          }}
        >
          {method === "emailCode" ? (
            <>
              <p>
                {t("createAccount.weSentCodeTo")} <strong>{prompt.emailAddress}</strong>
              </p>
              <VerificationCodeField
                value={verificationCode}
                onChange={setVerificationCode}
                error={error === "code"}
              />
            </>
          ) : (
            <>
              <Field
                name="reverifyPassword"
                id="reverifyPassword"
                type="password"
                label={t("label.password")}
                error={error === "password"}
                inputProps={{
                  value: password,
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value),
                  autoComplete: "current-password",
                }}
              />
              <ErrorMessage id="reverifyPassword-error" error={error === "password"}>
                {t("error.account.currentPasswordIncorrect")}
              </ErrorMessage>
            </>
          )}
          <div className={styles.actions}>
            <Button variant="primary" size="sm" type="submit" disabled={prompt.isBusy}>
              {method === "emailCode" ? t("createAccount.confirmCode") : t("reverify.confirm")}
            </Button>
            {method === "emailCode" && (
              <Button
                variant="text"
                size="sm"
                type="button"
                disabled={prompt.isBusy}
                onClick={() => {
                  void sendCode()
                }}
              >
                {t("createAccount.sendAgain")}
              </Button>
            )}
          </div>
        </form>
      )}

      <div className={styles.actions}>
        {otherMethod && (
          <Button
            variant="text"
            size="sm"
            type="button"
            onClick={() => {
              setError(null)
              setMethod(otherMethod)
            }}
          >
            {otherMethod === "password" ? t("reverify.usePassword") : t("reverify.useCode")}
          </Button>
        )}
        <Button variant="text" size="sm" type="button" onClick={prompt.cancel}>
          {t("label.cancel")}
        </Button>
      </div>
    </div>
  )
}

export default ReverifyIdentity
