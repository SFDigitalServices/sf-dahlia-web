import { useCallback, useMemo } from "react"
import { useUser } from "@clerk/react"

import { AccountOutcome, AccountSession } from "../../accountSession"
import { isReverificationCancelled, useClerkReverifiedAction } from "./ClerkReverificationProvider"

// Local shapes for the parts of Clerk's email address resource we use. @clerk/react v6's types
// don't resolve under moduleResolution:"node", so these keep the calls below honest.
type EmailAddress = {
  id: string
  emailAddress: string
  verification: { status: string | null } | null
  prepareVerification: (params: { strategy: "email_code" }) => Promise<EmailAddress>
  attemptVerification: (params: { code: string }) => Promise<EmailAddress>
  destroy: () => Promise<void>
}

const SUCCESS: AccountOutcome = {}
const NOT_READY: AccountOutcome = {
  notReady: true,
  error: new Error("Account session is not ready"),
}

const failure = (message: string, error: unknown): AccountOutcome => {
  if (isReverificationCancelled(error)) return { error, cancelled: true }
  console.error(message, error)
  return { error }
}

const sameEmail = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export const useClerkAccountSession = (): AccountSession => {
  const { isLoaded: isAccountInitialized, user } = useUser()

  const addresses = useCallback(
    (): EmailAddress[] => (user?.emailAddresses as EmailAddress[] | undefined) ?? [],
    [user]
  )
  const findAddress = useCallback(
    (email: string) => addresses().find(({ emailAddress }) => sameEmail(emailAddress, email)),
    [addresses]
  )

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
      if (!isAccountInitialized || !user) return NOT_READY

      try {
        // An abandoned attempt leaves the address on the account, and adding it again would
        // fail as a duplicate.
        const leftover = findAddress(email)
        if (leftover && leftover.id !== user.primaryEmailAddressId) {
          await removeEmailAddress(leftover)
        }

        const address = await createEmailAddress(email)
        await address.prepareVerification({ strategy: "email_code" })
        return SUCCESS
      } catch (error) {
        return failure("Start email change error:", error)
      }
    },
    [isAccountInitialized, user, findAddress, removeEmailAddress, createEmailAddress]
  )

  const resendEmailChangeCode = useCallback(
    async (email: string): Promise<AccountOutcome> => {
      const address = findAddress(email)
      if (!address) return NOT_READY

      try {
        await address.prepareVerification({ strategy: "email_code" })
        return SUCCESS
      } catch (error) {
        return failure("Resend email change code error:", error)
      }
    },
    [findAddress]
  )

  const verifyEmailChange = useCallback(
    async (email: string, verificationCode: string): Promise<AccountOutcome> => {
      const address = findAddress(email)
      if (!user || !address) return NOT_READY

      // Already verified when the user cancelled reverification after entering the code.
      if (address.verification?.status !== "verified") {
        try {
          const verified = await address.attemptVerification({ code: verificationCode })
          if (verified.verification?.status !== "verified") {
            const error = new Error(`Email code not verified: ${verified.verification?.status}`)
            return { error, codeRejected: true }
          }
        } catch (error) {
          console.error("Email change code error:", error)
          return { error, codeRejected: true }
        }
      }

      const previous = addresses().filter(({ id }) => id !== address.id)
      try {
        await makePrimary(address.id)
      } catch (error) {
        return failure("Make email primary error:", error)
      }

      // The new login email already works, so a leftover old address is logged, not reported.
      for (const old of previous) {
        try {
          await removeEmailAddress(old)
        } catch (error) {
          console.error("Remove previous email error:", error)
        }
      }
      return SUCCESS
    },
    [user, findAddress, addresses, makePrimary, removeEmailAddress]
  )

  const loginEmail = (user?.primaryEmailAddress as { emailAddress?: string } | null | undefined)
    ?.emailAddress

  return useMemo(
    (): AccountSession => ({
      isAccountInitialized,
      loginEmail,
      startEmailChange,
      resendEmailChangeCode,
      verifyEmailChange,
    }),
    [isAccountInitialized, loginEmail, startEmailChange, resendEmailChangeCode, verifyEmailChange]
  )
}
