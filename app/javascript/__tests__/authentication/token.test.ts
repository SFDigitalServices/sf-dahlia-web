import {
  clearHeadersSignOut,
  clearHeaders,
  clearHeadersTimeOut,
  clearHeadersConnectionIssue,
  attemptToSetAuthHeadersFromURL,
} from "../../authentication/token"
import { setupLocationAndRouteMock } from "../__util__/accountUtils"

const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "auth_headers"

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
})

describe("token.ts", () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    setupLocationAndRouteMock()
  })
  afterEach(() => {
    window.location = originalLocation
  })

  it("clearHeaders", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")

    clearHeaders()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  })
  it("clearHeadersSignOut", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersSignOut()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  })
  it("clearHeadersTimeOut", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersTimeOut()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  })
  it("signOutConnectionIssue", () => {
    mockGetItem.mockImplementationOnce(() => "test-local-storage-key")
    clearHeadersConnectionIssue()
    expect(mockRemoveItem).toHaveBeenCalledWith(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  })
  it("getTemporaryAuthParamsFromURL", () => {
    // Mock the window.location.href
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost:3000/reset-password?access-token=DDDDD&client=CCCCC&client_id=BBBBB&config=default&expiry=100&reset_password=true&token=AAAAAA&uid=test%40test.com",
      },
    })

    const result = attemptToSetAuthHeadersFromURL()
    expect(result).toEqual(true)

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
