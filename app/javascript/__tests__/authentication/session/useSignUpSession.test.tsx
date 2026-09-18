import { renderHook } from "@testing-library/react"
import { useSignUp, useUser } from "@clerk/react"
import { useNavigate } from "react-router"

import { useSignUpSession } from "../../../authentication/session/useSignUpSession"
import { getCurrentLanguage } from "../../../util/languageUtil"

jest.mock("@clerk/react", () => ({
  useSignUp: jest.fn(),
  useUser: jest.fn(),
}))

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

type SignUpStub = {
  status: string | null
  unverifiedFields: string[]
  missingFields: string[]
  create: jest.Mock
  verifications: { sendEmailCode: jest.Mock; verifyEmailCode: jest.Mock }
  finalize: jest.Mock
}

const clerkError = { code: "form_identifier_exists" }

const renderSession = () => renderHook(() => useSignUpSession()).result

describe("useSignUpSession", () => {
  let signUp: SignUpStub
  let updatePassword: jest.Mock
  let mockNavigate: jest.Mock
  let consoleError: jest.SpyInstance

  const mockSignUp = (fetchStatus = "idle") =>
    (useSignUp as jest.Mock).mockReturnValue({ signUp, fetchStatus })

  const mockUser = (user: unknown, isLoaded = true) =>
    (useUser as jest.Mock).mockReturnValue({ isLoaded, user })

  beforeEach(() => {
    signUp = {
      status: "missing_requirements",
      unverifiedFields: ["email_address"],
      missingFields: [],
      create: jest.fn().mockResolvedValue({ error: null }),
      verifications: {
        sendEmailCode: jest.fn().mockResolvedValue({ error: null }),
        verifyEmailCode: jest.fn().mockResolvedValue({ error: null }),
      },
      finalize: jest.fn().mockResolvedValue({ error: null }),
    }
    updatePassword = jest.fn().mockResolvedValue(undefined)
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignUp()
    mockUser({ updatePassword, passwordEnabled: false })
    // The adapter holds the provider's error, so the logging lives there.
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  describe("busy state", () => {
    it("is busy while the provider is fetching", () => {
      mockSignUp("fetching")

      expect(renderSession().current.isBusy).toBe(true)
    })

    it("is not busy once the provider settles", () => {
      expect(renderSession().current.isBusy).toBe(false)
    })
  })

  describe("createAccount", () => {
    it("creates the account and sends the first code", async () => {
      const result = await renderSession().current.createAccount("a@b.com")

      const locale = getCurrentLanguage()
      expect(signUp.create).toHaveBeenCalledWith({
        emailAddress: "a@b.com",
        locale,
        unsafeMetadata: { locale },
      })
      expect(signUp.verifications.sendEmailCode).toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through when the address is already taken", async () => {
      signUp.create.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.createAccount("a@b.com")

      expect(result.error).toBe(clerkError)
      expect(signUp.verifications.sendEmailCode).not.toHaveBeenCalled()
    })

    it("reports an error when the account still needs more than its email verified", async () => {
      signUp.missingFields = ["password"]

      const result = await renderSession().current.createAccount("a@b.com")

      expect(result.error).toBeTruthy()
    })
  })

  describe("resendEmailCode", () => {
    it("sends another code without recreating the account", async () => {
      const result = await renderSession().current.resendEmailCode()

      expect(signUp.verifications.sendEmailCode).toHaveBeenCalled()
      expect(signUp.create).not.toHaveBeenCalled()
      expect(result.error).toBeUndefined()
    })

    it("fails without recreating the account when the provider rejects it", async () => {
      signUp.verifications.sendEmailCode.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.resendEmailCode()

      expect(result.error).toBe(clerkError)
      expect(signUp.create).not.toHaveBeenCalled()
    })

    it("reports an error when the attempt no longer awaits the email", async () => {
      signUp.unverifiedFields = []

      const result = await renderSession().current.resendEmailCode()

      expect(result.error).toBeTruthy()
      expect(signUp.create).not.toHaveBeenCalled()
    })
  })

  describe("verifyEmailCode", () => {
    it("completes on a valid code", async () => {
      signUp.status = "complete"

      const result = await renderSession().current.verifyEmailCode("123456")

      expect(signUp.verifications.verifyEmailCode).toHaveBeenCalledWith({ code: "123456" })
      expect(result.error).toBeUndefined()
    })

    it("passes the provider's error through on an invalid code", async () => {
      signUp.verifications.verifyEmailCode.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.verifyEmailCode("000000")

      expect(result.error).toBe(clerkError)
    })

    it("reports an error when the attempt does not complete", async () => {
      const result = await renderSession().current.verifyEmailCode("123456")

      expect(result.error).toBeTruthy()
    })
  })

  describe("activateSession", () => {
    it("lets the provider decorate the url and carries the flow along", async () => {
      signUp.finalize.mockImplementation(async ({ navigate }) => {
        await navigate({ decorateUrl: (url: string) => `${url}?__clerk=1` })
        return { error: null }
      })

      await renderSession().current.activateSession("/create-account/password", { flow: "signUp" })

      expect(mockNavigate).toHaveBeenCalledWith("/create-account/password?__clerk=1", {
        state: { flow: "signUp" },
      })
    })

    it("passes the provider's error through", async () => {
      signUp.finalize.mockResolvedValue({ error: clerkError })

      const result = await renderSession().current.activateSession("/create-account/password")

      expect(result.error).toBe(clerkError)
    })
  })

  describe("the password step", () => {
    it("sets the password on the account sign-up created", async () => {
      const result = await renderSession().current.setPassword("newsecret1")

      expect(updatePassword).toHaveBeenCalledWith({ newPassword: "newsecret1" })
      expect(result.error).toBeUndefined()
    })

    it("reports a rejection as an outcome rather than throwing", async () => {
      const rejection = new Error("password too common")
      updatePassword.mockRejectedValue(rejection)

      const result = await renderSession().current.setPassword("password")

      expect(result.error).toBe(rejection)
      expect(consoleError).toHaveBeenCalledWith("Add password error:", rejection)
    })

    it("reports whether the account already has a password", () => {
      mockUser({ updatePassword, passwordEnabled: true })

      expect(renderSession().current.hasPassword).toBe(true)
    })

    it("reports no password before the account check settles", () => {
      mockUser(null, false)

      const session = renderSession().current
      expect(session.isAccountInitialized).toBe(false)
      expect(session.hasPassword).toBe(false)
    })

    it("refuses to set a password before the account check settles", async () => {
      mockUser(null, false)

      const result = await renderSession().current.setPassword("newsecret1")

      expect(result.notReady).toBe(true)
      expect(updatePassword).not.toHaveBeenCalled()
    })

    it("refuses to set a password when the check settles on no account", async () => {
      mockUser(null)

      const session = renderSession().current
      expect(session.isAccountInitialized).toBe(true)
      expect((await session.setPassword("newsecret1")).notReady).toBe(true)
      expect(updatePassword).not.toHaveBeenCalled()
    })
  })

  it("refuses every operation before the provider is ready", async () => {
    ;(useSignUp as jest.Mock).mockReturnValue({ signUp: undefined, fetchStatus: "idle" })
    const session = renderSession().current

    expect((await session.createAccount("a@b.com")).error).toBeTruthy()
    expect((await session.resendEmailCode()).error).toBeTruthy()
    expect((await session.verifyEmailCode("123456")).error).toBeTruthy()
    expect((await session.activateSession("/create-account/password")).error).toBeTruthy()
  })
})
