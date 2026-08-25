import {
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
} from "../../api/authApiService"
import { mockProfileStub } from "../__util__/accountUtils"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
  authenticatedPut: jest.fn(),
  authenticatedPost: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}))

describe("authApiService", () => {
  beforeEach(() => {
    ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedDelete as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedPut as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedPost as jest.Mock).mockResolvedValue({ data: { success: true } })
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
    it("calls apiService authenticatedGet", async () => {
      const url = "/api/v1/auth/validate_token"
      await getProfile()
      expect(authenticatedGet).toHaveBeenCalledWith(url)
    })

    it("fetches Clerk profile with the session token", async () => {
      await getProfile("clerk-session-token")
      expect(get).toHaveBeenCalledWith("/api/v1/account/profile", {
        headers: { Authorization: "Bearer clerk-session-token" },
      })
    })
  })

  describe("getApplications", () => {
    it("calls apiService authenticatedGet", async () => {
      const url = "/api/v1/account/my-applications"
      await getApplications()
      expect(authenticatedGet).toHaveBeenCalledWith(url)
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
    it("calls apiService authenticatedPut", async () => {
      const url = "/api/v1/account/update"
      await updatePhone(mockProfileStub)
      expect(authenticatedPut).toHaveBeenCalledWith(url, {
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

  describe("deleteApplication", () => {
    it("calls apiService authenticatedDelete", async () => {
      const id = "test-id"
      const url = `/api/v1/short-form/application/${id}`
      await deleteApplication(id)
      expect(authenticatedDelete).toHaveBeenCalledWith(url)
    })
  })
})
