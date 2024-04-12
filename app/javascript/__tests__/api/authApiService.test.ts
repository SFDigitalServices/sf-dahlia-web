import { authenticatedGet, post, put } from "../../api/apiService"

import { signIn, getProfile, forgotPassword, updatePassword } from "../../api/authApiService"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  authenticatedGet: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}))

describe("authApiService", () => {
  beforeEach(() => {
    ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
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

  describe("getProfile", () => {
    it("calls apiService authenticatedGet", async () => {
      const url = "/api/v1/auth/validate_token"
      await getProfile()
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
      const url = "/user/update-password"
      const token = "test-token"
      const password = "test-password"
      const passwordConfirmation = password
      await updatePassword(token, password, password)
      expect(put).toHaveBeenCalledWith(url, { password, passwordConfirmation, token })
    })
  })
})
