import UserReducer from "../../../authentication/context/UserReducer"
import {
  clearHeaders,
  clearHeadersSignOut,
  clearHeadersTimeOut,
} from "../../../authentication/token"

jest.mock("../../../authentication/token", () => {
  return {
    clearHeadersSignOut: jest.fn(),
    clearHeaders: jest.fn(),
    clearHeadersTimeOut: jest.fn(),
  }
})

describe("UserReducer", () => {
  it("systemSignOut", () => {
    const initialState = { loading: false, initialStateLoaded: false }
    const updateAction = {
      type: "SystemSignOut",
      newState: { loading: false, initialStateLoaded: true },
    }
    const updatedState = UserReducer(initialState, updateAction)

    expect(clearHeaders).toHaveBeenCalled()
    expect(updatedState).toEqual({ loading: false, initialStateLoaded: true })
  })
  it("timeOut", () => {
    const initialState = { loading: false, initialStateLoaded: false }
    const updateAction = {
      type: "TimeOut",
      newState: { loading: false, initialStateLoaded: true },
    }
    const updatedState = UserReducer(initialState, updateAction)

    expect(clearHeadersTimeOut).toHaveBeenCalled()
    expect(updatedState).toEqual({ loading: false, initialStateLoaded: true })
  })
  it("userSignOut", () => {
    const initialState = { loading: false, initialStateLoaded: false }
    const updateAction = {
      type: "UserSignOut",
      newState: { loading: false, initialStateLoaded: true },
    }
    const updatedState = UserReducer(initialState, updateAction)

    expect(clearHeadersSignOut).toHaveBeenCalled()
    expect(updatedState).toEqual({ loading: false, initialStateLoaded: true })
  })
})
