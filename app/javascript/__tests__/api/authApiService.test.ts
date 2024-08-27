import {
  authenticatedGet,
  authenticatedDelete,
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
} from "../../api/authApiService"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
  authenticatedPut: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}))

describe("authApiService", () => {
  beforeEach(() => {
    ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedDelete as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    ;(authenticatedPut as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
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
    it("calls apiService post and sets headers", async () => {
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
        confirm_success_url: "http://localhost:3000/my-account",
        config_name: "default",
      }
      const storageSpy = jest.spyOn(Storage.prototype, "setItem")
      await createAccount(data.user, data.contact)
      expect(post).toHaveBeenCalledWith(url, data)
      expect(storageSpy).toHaveBeenCalled()
    })
  })

  describe("getProfile", () => {
    it("calls apiService authenticatedGet", async () => {
      const url = "/api/v1/auth/validate_token"
      await getProfile()
      expect(authenticatedGet).toHaveBeenCalledWith(url)
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
    it("calls apiService put", async () => {
      const url = "/user/forgot-password"
      const email = "email@test.com"
      await forgotPassword(email)
      expect(put).toHaveBeenCalledWith(url, { email, appUrl: "http://localhost" })
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

  describe("deleteApplication", () => {
    it("calls apiService authenticatedDelete", async () => {
      const id = "test-id"
      const url = `/api/v1/short-form/application/${id}`
      await deleteApplication(id)
      expect(authenticatedDelete).toHaveBeenCalledWith(url)
    })
  })
})
