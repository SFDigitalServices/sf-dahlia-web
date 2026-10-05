import {
  apiDelete,
  authenticatedGet,
  authenticatedDelete,
  get,
  post,
  put,
  authenticatedPut,
} from "../../api/apiService"

import {
  signIn,
  createAccount,
  getProfile,
  forgotPassword,
  updatePassword,
  getApplications,
  deleteApplication,
  resetPassword,
  updatePhone,
  getHousingCounselorAgencies,
  updateHousingCounselorAccess,
  authorizeHousingCounselor,
  clearHousingCounselorSession,
  updateNameOrDOB,
  updateEmail,
} from "../../api/authApiService"
import { mockProfileStub } from "../__util__/accountUtils"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  apiDelete: jest.fn(),
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
  authenticatedPut: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}))

describe("authApiService", () => {
  beforeEach(() => {
    ;(apiDelete as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedDelete as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedPut as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(get as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(post as jest.Mock).mockResolvedValue({ data: "test-data", headers: "test-headers" })
    ;(put as jest.Mock).mockResolvedValue({ data: { message: "test-message" } })
  })

  describe("signIn", () => {
    it("calls apiService post and sets headers", async () => {
      const url = "/api/v1/auth/sign_in"
      const data = {
        email: "email@test.com",
        password: "test-password",
      }
      const storageSpy = jest.spyOn(Storage.prototype, "setItem")
      await signIn(data.email, data.password)
      expect(post).toHaveBeenCalledWith(url, data)
      expect(storageSpy).toHaveBeenCalled()
    })
  })

  describe("createAccount", () => {
    it("calls apiService post", async () => {
      const url = "/api/v1/auth"
      const data = {
        user: {
          email: "email@test.com",
          password: "testpassword1",
          password_confirmation: "testpassword1",
        },
        contact: {
          firstName: "test",
          lastName: "test",
          email: "email@test.com",
          DOB: "1980-01-01",
        },
        locale: "en",
        confirm_success_url: "https://dahlia-full.herokuapp.com/account",
        config_name: "default",
      }
      const storageSpy = jest.spyOn(Storage.prototype, "setItem")
      await createAccount(data.user, data.contact)
      expect(post).toHaveBeenCalledWith(url, data)
      expect(storageSpy).not.toHaveBeenCalled()
    })
  })

  describe("getProfile", () => {
    it("uses Devise when Clerk is disabled", async () => {
      await getProfile({ clerkEnabled: false })
      expect(authenticatedGet).toHaveBeenCalledWith("/api/v1/auth/validate_token")
      expect(get).not.toHaveBeenCalled()
    })

    it("fetches the Clerk profile with the session token", async () => {
      await getProfile({ clerkEnabled: true, sessionToken: "clerk-session-token" })
      expect(get).toHaveBeenCalledWith("/api/v1/account/profile", {
        headers: { Authorization: "Bearer clerk-session-token" },
      })
      expect(authenticatedGet).not.toHaveBeenCalled()
    })

    it("rejects without falling back to Devise when the Clerk token is missing", async () => {
      await expect(getProfile({ clerkEnabled: true })).rejects.toThrow(
        "Missing Clerk session token"
      )
      expect(get).not.toHaveBeenCalled()
      expect(authenticatedGet).not.toHaveBeenCalled()
    })
  })

  // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  // The Devise and missing-token cases go with the flag; the Clerk case stays.
  describe("getApplications", () => {
    const url = "/api/v1/account/my-applications"

    it("calls apiService authenticatedGet when Clerk is disabled", async () => {
      await getApplications({ clerkEnabled: false })
      expect(authenticatedGet).toHaveBeenCalledWith(url)
      expect(get).not.toHaveBeenCalled()
    })

    it("fetches with the session token when Clerk is enabled", async () => {
      await getApplications({ clerkEnabled: true, sessionToken: "clerk-session-token" })
      expect(get).toHaveBeenCalledWith(url, {
        headers: { Authorization: "Bearer clerk-session-token" },
      })
      expect(authenticatedGet).not.toHaveBeenCalled()
    })

    it("throws rather than falling back to Devise when Clerk is enabled and the token is missing", async () => {
      await expect(getApplications({ clerkEnabled: true })).rejects.toThrow(
        "Missing Clerk session token"
      )
      expect(authenticatedGet).not.toHaveBeenCalled()
      expect(get).not.toHaveBeenCalled()
    })
  })

  describe("forgotPassword", () => {
    it("calls apiService post", async () => {
      const url = "/api/v1/auth/password"
      const email = "email@test.com"
      await forgotPassword(email)
      expect(post).toHaveBeenCalledWith(url, {
        email,
        locale: "en",
        redirect_url: `${window.location.origin}/reset-password`,
      })
    })
  })

  describe("resetPassword", () => {
    it("calls apiService put", async () => {
      const url = "/api/v1/auth/password"
      const newPassword = "abc123"
      await resetPassword(newPassword)
      expect(authenticatedPut).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          password: newPassword,
          password_confirmation: newPassword,
        })
      )
    })
  })

  describe("updatePassword", () => {
    it("calls apiService put", async () => {
      const url = "/api/v1/auth/password"
      const oldPassword = "old-password"
      const newPassword = "test-password"
      await updatePassword(newPassword, oldPassword)
      expect(authenticatedPut).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          password: newPassword,
          password_confirmation: newPassword,
          current_password: oldPassword,
        })
      )
    })
  })

  describe("updatePhone", () => {
    it("uses Devise when Clerk is disabled", async () => {
      await updatePhone(mockProfileStub, { clerkEnabled: false })
      expect(authenticatedPut).toHaveBeenCalledWith("/api/v1/account/update", {
        contact: {
          email: mockProfileStub.email,
          firstName: mockProfileStub.firstName,
          middleName: mockProfileStub.middleName,
          lastName: mockProfileStub.lastName,
          DOB: mockProfileStub.DOB,
          phone: mockProfileStub.phone,
          phoneType: mockProfileStub.phoneType,
          alternatePhone: mockProfileStub.alternatePhone,
          alternatePhoneType: mockProfileStub.alternatePhoneType,
          housingCounselingAgencyId: mockProfileStub.housingCounselingAgencyId,
        },
      })
      expect(put).not.toHaveBeenCalled()
    })

    it("uses the Clerk session token when Clerk is enabled", async () => {
      await updatePhone(mockProfileStub, {
        clerkEnabled: true,
        sessionToken: "clerk-session-token",
      })
      expect(put).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({ phone: mockProfileStub.phone }),
        }),
        { headers: { Authorization: "Bearer clerk-session-token" } }
      )
      expect(authenticatedPut).not.toHaveBeenCalled()
    })
  })

  describe("authorizeHousingCounselor", () => {
    it("posts the JWT with a session token", async () => {
      await authorizeHousingCounselor("jwt.token", "session-token")
      expect(post).toHaveBeenCalledWith(
        "/api/v1/housing-counselor/access",
        { t: "jwt.token" },
        { headers: { Authorization: "Bearer session-token" } }
      )
    })
  })

  describe("clearHousingCounselorSession", () => {
    it("deletes the housing counselor session", async () => {
      ;(apiDelete as jest.Mock).mockResolvedValue({ data: { success: true } })
      await clearHousingCounselorSession()
      expect(apiDelete).toHaveBeenCalledWith("/api/v1/housing-counselor/access")
    })

    it("resolves rather than rejecting when the request fails, so it can't block sign in or out", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
      const error = new Error("Network Error")
      ;(apiDelete as jest.Mock).mockRejectedValue(error)

      await expect(clearHousingCounselorSession()).resolves.toBeUndefined()
      expect(consoleError).toHaveBeenCalledWith("Error: Failed to clear housing counselor session")

      consoleError.mockRestore()
    })
  })

  describe("getHousingCounselorAgencies", () => {
    it("calls apiService get with a session token and returns agencies", async () => {
      const agencies = [
        { id: "123", name: "Test Agency A", shortName: "A" },
        { id: "456", name: "Test Agency B", shortName: "B" },
      ]
      ;(get as jest.Mock).mockResolvedValue({ data: { agencies } })
      const result = await getHousingCounselorAgencies("session-token")
      expect(get).toHaveBeenCalledWith("/api/v1/housing-counselor/agencies", {
        headers: { Authorization: "Bearer session-token" },
      })
      expect(result).toEqual(agencies)
    })
  })

  describe("updateHousingCounselorAccess", () => {
    it("calls apiService put with the contact, agency id, and session token", async () => {
      await updateHousingCounselorAccess(mockProfileStub, "session-token")
      expect(put).toHaveBeenCalledWith(
        "/api/v1/account/update-housing-counselor",
        {
          contact: {
            email: mockProfileStub.email,
            firstName: mockProfileStub.firstName,
            middleName: mockProfileStub.middleName,
            lastName: mockProfileStub.lastName,
            DOB: mockProfileStub.DOB,
            phone: mockProfileStub.phone,
            phoneType: mockProfileStub.phoneType,
            alternatePhone: mockProfileStub.alternatePhone,
            alternatePhoneType: mockProfileStub.alternatePhoneType,
            housingCounselingAgencyId: mockProfileStub.housingCounselingAgencyId,
          },
        },
        { headers: { Authorization: "Bearer session-token" } }
      )
    })

    it("calls update-housing-counselor to clear housingCounselingAgencyId", async () => {
      const user = {
        ...mockProfileStub,
        housingCounselingAgencyId: null,
      }
      ;(put as jest.Mock).mockResolvedValue({ data: { contact: user } })

      await updateHousingCounselorAccess(user, "session-token")

      expect(put).toHaveBeenCalledWith(
        "/api/v1/account/update-housing-counselor",
        expect.objectContaining({
          contact: expect.objectContaining({
            housingCounselingAgencyId: null,
          }),
        }),
        { headers: { Authorization: "Bearer session-token" } }
      )
    })
  })

  // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  // The Devise and missing-token cases go with the flag; the Clerk case stays.
  describe("deleteApplication", () => {
    const id = "test-id"
    const url = `/api/v1/short-form/application/${id}`

    it("calls apiService authenticatedDelete when Clerk is disabled", async () => {
      await deleteApplication(id, { clerkEnabled: false })
      expect(authenticatedDelete).toHaveBeenCalledWith(url)
      expect(apiDelete).not.toHaveBeenCalled()
    })

    it("deletes with the session token when Clerk is enabled", async () => {
      await deleteApplication(id, { clerkEnabled: true, sessionToken: "clerk-session-token" })
      expect(apiDelete).toHaveBeenCalledWith(url, {
        headers: { Authorization: "Bearer clerk-session-token" },
      })
      expect(authenticatedDelete).not.toHaveBeenCalled()
    })

    it("throws rather than falling back to Devise when Clerk is enabled and the token is missing", async () => {
      await expect(deleteApplication(id, { clerkEnabled: true })).rejects.toThrow(
        "Missing Clerk session token"
      )
      expect(authenticatedDelete).not.toHaveBeenCalled()
      expect(apiDelete).not.toHaveBeenCalled()
    })
  })

  describe("updateNameOrDOB", () => {
    it("uses Devise when Clerk is disabled", async () => {
      await updateNameOrDOB(mockProfileStub, { clerkEnabled: false })
      expect(authenticatedPut).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({
            firstName: mockProfileStub.firstName,
            DOB: mockProfileStub.DOB,
          }),
        })
      )
      expect(put).not.toHaveBeenCalled()
    })

    it("uses the Clerk session token when Clerk is enabled", async () => {
      await updateNameOrDOB(mockProfileStub, {
        clerkEnabled: true,
        sessionToken: "clerk-session-token",
      })
      expect(put).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({
            firstName: mockProfileStub.firstName,
            DOB: mockProfileStub.DOB,
          }),
        }),
        { headers: { Authorization: "Bearer clerk-session-token" } }
      )
      expect(authenticatedPut).not.toHaveBeenCalled()
    })
  })

  describe("updateEmail", () => {
    it("uses the Devise auth endpoint when Clerk is disabled", async () => {
      ;(authenticatedPut as jest.Mock).mockResolvedValue({ data: { status: "success" } })
      const result = await updateEmail(mockProfileStub, { clerkEnabled: false })
      expect(authenticatedPut).toHaveBeenCalledWith("/api/v1/auth", {
        user: { email: mockProfileStub.email },
      })
      expect(put).not.toHaveBeenCalled()
      expect(result).toBe("success")
    })

    it("updates the contact through the account endpoint when Clerk is enabled", async () => {
      ;(put as jest.Mock).mockResolvedValue({ data: { contact: mockProfileStub } })
      const result = await updateEmail(mockProfileStub, {
        clerkEnabled: true,
        sessionToken: "clerk-session-token",
      })
      expect(put).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({ email: mockProfileStub.email }),
        }),
        { headers: { Authorization: "Bearer clerk-session-token" } }
      )
      expect(authenticatedPut).not.toHaveBeenCalled()
      expect(result).toEqual(mockProfileStub)
    })
  })
})
