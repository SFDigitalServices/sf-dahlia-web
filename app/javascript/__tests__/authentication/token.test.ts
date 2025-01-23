import {
  clearHeadersSignOut,
  clearHeaders,
  clearHeadersTimeOut,
  clearHeadersConnectionIssue,
  getTemporaryAuthParamsFromUrl,
  setAuthHeadersFromUrl,
} from "../../authentication/token"

const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "auth_headers"

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
})

describe("token.ts", () => {
  it("clearHeaders", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")

    clearHeaders()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  })
  it("clearHeadersSignOut", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersSignOut()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
    expect(mockSetItem).toHaveBeenCalledWith("alert_message_success", "You are signed out.")
  })
  it("clearHeadersTimeOut", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersTimeOut()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
    expect(mockSetItem).toHaveBeenCalledWith(
      "alert_message_secondary",
      "You were inactive for more than 30 minutes, so we signed you out. We do this for your security. Sign in again to continue."
    )
  })
  it("signOutConnectionIssue", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersConnectionIssue()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
    expect(mockSetItem).toHaveBeenCalledWith(
      "alert_message_secondary",
      "There was a connection issue, so we signed you out. We do this for your security. Sign in again to continue."
    )
  })
  it("getTemporaryAuthParamsFromURL", () => {
    // Mock the window.location.href
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost:3000/reset-password?access-token=DDDDD&client=CCCCC&client_id=BBBBB&config=default&expiry=100&reset_password=true&token=AAAAAA&uid=test%40test.com",
      },
    })

    const expectedParams = {
      expiry: "100",
      accessToken: "DDDDD",
      client: "CCCCC",
      uid: "test@test.com",
      tokenType: "Bearer",
      reset_password: "true",
    }

    const result = getTemporaryAuthParamsFromUrl()
    expect(result).toEqual(expectedParams)

    const setAuthReturn = setAuthHeadersFromUrl(result)

    expect(setAuthReturn).toEqual(true)
    expect(mockSetItem).toHaveBeenCalledWith(
      ACCESS_TOKEN_LOCAL_STORAGE_KEY,
      JSON.stringify({
        expiry: "100",
        "access-token": "DDDDD",
        client: "CCCCC",
        uid: "test@test.com",
        "token-type": "Bearer",
      })
    )
  })
})
