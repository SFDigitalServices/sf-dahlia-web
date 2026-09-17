import { renderHook } from "@testing-library/react"
import { useClerk, useSignIn } from "@clerk/react"
import { useNavigate } from "react-router"

import { useSignInSession } from "../../../authentication/session/useSignInSession"

jest.mock("@clerk/react", () => ({
  useSignIn: jest.fn(),
  useClerk: jest.fn(),
}))

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

type SignInStub = {
  status: string | null
  create: jest.Mock
  emailCode: { sendCode: jest.Mock; verifyCode: jest.Mock }
  resetPasswordEmailCode: { sendCode: jest.Mock; verifyCode: jest.Mock; submitPassword: jest.Mock }
  finalize: jest.Mock
}

const clerkError = { code: "form_password_incorrect" }

const renderSession = () => renderHook(() => useSignInSession()).result

describe("useSignInSession", () => {
  let signIn: SignInStub
  let mockNavigate: jest.Mock
  let consoleError: jest.SpyInstance

  const mockSignIn = (fetchStatus = "idle") =>
    (useSignIn as jest.Mock).mockReturnValue({ signIn, fetchStatus })

  const mockLastStrategy = (strategy: string | null) =>
    (useClerk as jest.Mock).mockReturnValue({ client: { lastAuthenticationStrategy: strategy } })

  beforeEach(() => {
    signIn = {
      status: "complete",
      create: jest.fn().mockResolvedValue({ error: null }),
      emailCode: {
        sendCode: jest.fn().mockResolvedValue({ error: null }),
        verifyCode: jest.fn().mockResolvedValue({ error: null }),
      },
      resetPasswordEmailCode: {
        sendCode: jest.fn().mockResolvedValue({ error: null }),
        verifyCode: jest.fn().mockResolvedValue({ error: null }),
        submitPassword: jest.fn().mockResolvedValue({ error: null }),
      },
      finalize: jest.fn().mockResolvedValue({ error: null }),
    }
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignIn()
    mockLastStrategy(null)
    // The adapter holds the provider's error, so the logging lives there.
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  describe("busy state and the remembered method", () => {
    it("is busy while the provider is fetching", () => {
      mockSignIn("fetching")

      expect(renderSession().current.isBusy).toBe(true)
    })

    it("is not busy once the provider settles", () => {
      expect(renderSession().current.isBusy).toBe(false)
    })

    it("prefers the email code when that is how the user last signed in", () => {
      mockLastStrategy("email_code")

      expect(renderSession().current.preferredMethod).toBe("emailCode")
    })

    it("prefers a password for any other remembered strategy", () => {
      mockLastStrategy("password")

      expect(renderSession().current.preferredMethod).toBe("password")
    })

    it("prefers a password when nothing is remembered", () => {
      expect(renderSession().current.preferredMethod).toBe("password")
    })
  })

  describe("signInWithPassword", () => {
    it("completes on success", async () => {
      const result = await renderSession().current.signInWithPassword("a@b.com", "secret")

      expect(signIn.create).toHaveBeenCalledWith({ identifier: "a@b.com", password: "secret" })
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through when it rejects the attempt", async () => {
      signIn.create.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.signInWithPassword("a@b.com", "wrong")

      expect(result.error).toBe(clerkError)
      expect(consoleError).toHaveBeenCalledWith("Sign in error:", clerkError)
    })

    // A dashboard change could introduce a factor this interface doesn't model.
    it("reports an error when the attempt needs another step", async () => {
      signIn.status = "needs_second_factor"

      const result = await renderSession().current.signInWithPassword("a@b.com", "secret")

      expect(result.error).toBeTruthy()
    })
  })

  describe("sendEmailCode", () => {
    it("starts an attempt and sends the code", async () => {
      signIn.status = "needs_first_factor"

      const result = await renderSession().current.sendEmailCode("a@b.com")

      expect(signIn.create).toHaveBeenCalledWith({ identifier: "a@b.com" })
      expect(signIn.emailCode.sendCode).toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through when the address is not usable", async () => {
      signIn.create.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.sendEmailCode("a@b.com")

      expect(result.error).toBe(clerkError)
      expect(signIn.emailCode.sendCode).not.toHaveBeenCalled()
    })
  })

  describe("resendEmailCode", () => {
    it("sends another code without restarting the attempt", async () => {
      signIn.status = "needs_first_factor"

      const result = await renderSession().current.resendEmailCode()

      expect(signIn.emailCode.sendCode).toHaveBeenCalled()
      expect(signIn.create).not.toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("fails without restarting the attempt when the provider rejects it", async () => {
      signIn.status = "needs_first_factor"
      signIn.emailCode.sendCode.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.resendEmailCode()

      expect(result.error).toBe(clerkError)
      expect(signIn.create).not.toHaveBeenCalled()
    })
  })

  describe("verifyEmailCode", () => {
    it("completes on a valid code", async () => {
      const result = await renderSession().current.verifyEmailCode("123456")

      expect(signIn.emailCode.verifyCode).toHaveBeenCalledWith({ code: "123456" })
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through on an invalid code", async () => {
      signIn.emailCode.verifyCode.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.verifyEmailCode("000000")

      expect(result.error).toBe(clerkError)
    })

    it("reports an error when the attempt does not complete", async () => {
      signIn.status = "needs_first_factor"

      const result = await renderSession().current.verifyEmailCode("123456")

      expect(result.error).toBeTruthy()
    })
  })

  describe("submitNewPassword", () => {
    it("completes the reset and signs out other sessions", async () => {
      const result = await renderSession().current.submitNewPassword("newsecret1")

      expect(signIn.resetPasswordEmailCode.submitPassword).toHaveBeenCalledWith({
        password: "newsecret1",
        signOutOfOtherSessions: true,
      })
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through when it rejects the password", async () => {
      signIn.resetPasswordEmailCode.submitPassword.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.submitNewPassword("short")

      expect(result.error).toBe(clerkError)
    })

    it("reports an error when the attempt does not complete", async () => {
      signIn.status = "needs_new_password"

      const result = await renderSession().current.submitNewPassword("newsecret1")

      expect(result.error).toBeTruthy()
    })
  })

  describe("isResetAttemptStale", () => {
    it("is stale when the provider has settled holding no attempt", () => {
      signIn.status = null

      expect(renderSession().current.isResetAttemptStale).toBe(true)
    })

    it("is not stale while the provider is still fetching", () => {
      signIn.status = null
      mockSignIn("fetching")

      expect(renderSession().current.isResetAttemptStale).toBe(false)
    })

    it("is not stale once an attempt is in progress", () => {
      signIn.status = "needs_new_password"

      expect(renderSession().current.isResetAttemptStale).toBe(false)
    })
  })

  describe("activateSession", () => {
    // The sign-in page needs a credential before it navigates.
    it("finalizes without navigating when given no destination", async () => {
      await renderSession().current.activateSession()

      expect(signIn.finalize).toHaveBeenCalledWith()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("lets the provider decorate the url when given a destination", async () => {
      signIn.finalize.mockImplementation(async ({ navigate }) => {
        await navigate({ decorateUrl: (url: string) => `${url}?__clerk=1` })
        return { error: null }
      })

      await renderSession().current.activateSession("/my-account")

      expect(mockNavigate).toHaveBeenCalledWith("/my-account?__clerk=1")
    })
  })

  it("refuses every operation before the provider is ready", async () => {
    ;(useSignIn as jest.Mock).mockReturnValue({ signIn: undefined, fetchStatus: "idle" })
    const session = renderSession().current

    expect((await session.signInWithPassword("a@b.com", "secret")).error).toBeTruthy()
    expect((await session.sendEmailCode("a@b.com")).error).toBeTruthy()
    expect((await session.resendEmailCode()).error).toBeTruthy()
    expect((await session.verifyEmailCode("123456")).error).toBeTruthy()
  })
})
