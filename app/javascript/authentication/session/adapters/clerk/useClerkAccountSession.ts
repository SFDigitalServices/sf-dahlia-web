import { useCallback, useMemo, useState } from "react"
import { useUser } from "@clerk/react"

import { AccountOutcome, AccountSession } from "../../accountSession"
import { isReverificationCancelled, useClerkReverifiedAction } from "./ClerkReverificationProvider"

// Local shapes for the parts of Clerk's email address resource we use. @clerk/react v6's types
// don't resolve under moduleResolution:"node", so these keep the calls below honest.
type EmailAddress = {
  id: string
  emailAddress: string
  verification: { status: string | null }
  prepareVerification: (params: { strategy: "email_code" }) => Promise<EmailAddress>
  attemptVerification: (params: { code: string }) => Promise<EmailAddress>
  destroy: () => Promise<void>
}

const SUCCESS: AccountOutcome = {}
const NOT_READY: AccountOutcome = {
  notReady: true,
  error: new Error("Account session is not ready"),
}

const clerkErrorCode = (error: unknown): string | undefined =>
  (error as { errors?: { code?: string }[] } | undefined)?.errors?.[0]?.code

const failure = (message: string, error: unknown): AccountOutcome => {
  if (isReverificationCancelled(error)) return { error, cancelled: true }
  console.error(message, error)
  return { error }
}

export const useClerkAccountSession = (): AccountSession => {
  const { isLoaded, user } = useUser()
  const [pendingAddress, setPendingAddress] = useState<EmailAddress | null>(null)

  // Adding an email, making it primary, and removing one are all sensitive to Clerk.
  const createEmailAddress = useClerkReverifiedAction(
    async (email: string): Promise<EmailAddress> => {
      if (!user) throw NOT_READY.error
      return (await user.createEmailAddress({ email })) as EmailAddress
    }
  )
  const makePrimary = useClerkReverifiedAction(async (emailAddressId: string) => {
    if (!user) throw NOT_READY.error
    await user.update({ primaryEmailAddressId: emailAddressId })
  })
  const removeEmailAddress = useClerkReverifiedAction((emailAddress: EmailAddress) =>
    emailAddress.destroy()
  )

  const startEmailChange = useCallback(
    async (email: string): Promise<AccountOutcome> => {
      if (!isLoaded || !user) return NOT_READY

      const addresses = user.emailAddresses as EmailAddress[]
      const existing = addresses.find(
        ({ emailAddress }) => emailAddress.toLowerCase() === email.toLowerCase()
      )
      if (existing?.id === user.primaryEmailAddressId) return { unchanged: true }

      try {
        // An earlier attempt that was never verified left this address on the account, and
        // creating it again would fail as a duplicate.
        const address = existing ?? (await createEmailAddress(email))
        await address.prepareVerification({ strategy: "email_code" })
        setPendingAddress(address)
        return SUCCESS
      } catch (error) {
        if (clerkErrorCode(error) === "form_identifier_exists") return { error, emailTaken: true }
        return failure("Start email change error:", error)
      }
    },
    [isLoaded, user, createEmailAddress]
  )

  const resendEmailChangeCode = useCallback(async (): Promise<AccountOutcome> => {
    if (!pendingAddress) return NOT_READY

    try {
      await pendingAddress.prepareVerification({ strategy: "email_code" })
      return SUCCESS
    } catch (error) {
      return failure("Resend email change code error:", error)
    }
  }, [pendingAddress])

  const verifyEmailChange = useCallback(
    async (verificationCode: string): Promise<AccountOutcome> => {
      if (!user || !pendingAddress) return NOT_READY

      try {
        const verified = await pendingAddress.attemptVerification({ code: verificationCode })
        if (verified.verification.status !== "verified") {
          return failure(
            "Email change code not verified:",
            new Error(`Email change code not verified: ${verified.verification.status}`)
          )
        }

        const previous = (user.emailAddresses as EmailAddress[]).filter(
          ({ id }) => id !== verified.id
        )
        await makePrimary(verified.id)
        // The backend and Salesforce assume one email per account.
        for (const address of previous) {
          await removeEmailAddress(address)
        }

        setPendingAddress(null)
        return SUCCESS
      } catch (error) {
        return failure("Verify email change error:", error)
      }
    },
    [user, pendingAddress, makePrimary, removeEmailAddress]
  )

  return useMemo(
    (): AccountSession => ({
      startEmailChange,
      resendEmailChangeCode,
      verifyEmailChange,
      pendingEmail: pendingAddress?.emailAddress,
    }),
    [startEmailChange, resendEmailChangeCode, verifyEmailChange, pendingAddress?.emailAddress]
  )
}
