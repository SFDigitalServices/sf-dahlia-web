import React from "react"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { User } from "../../authentication/user"

export const mockProfileStub: User = {
  uid: "abc123",
  id: 20,
  email: "email@email.com",
  created_at: new Date(),
  updated_at: new Date(),
  DOB: "1999-01-01",
  firstName: "FirstName",
  lastName: "LastName",
  middleName: "MiddleName",
}

export const setupUserContext = ({
  loggedIn,
  setUpMockLocation = true,
  saveProfileMock = jest.fn(),
  mockProfile = mockProfileStub,
}: {
  loggedIn: boolean
  setUpMockLocation?: boolean
  saveProfileMock?: jest.Mock
  mockProfile?: ContextProps["profile"]
}) => {
  const originalUseContext = React.useContext
  const originalLocation = window.location
  const mockContextValue: ContextProps = {
    profile: loggedIn ? mockProfile : undefined,
    signIn: jest.fn(),
    signOut: jest.fn(),
    timeOut: jest.fn(),
    saveProfile: saveProfileMock || jest.fn(),
    loading: false,
    initialStateLoaded: true,
  }

  jest.spyOn(React, "useContext").mockImplementation((context) => {
    if (context === UserContext) {
      return mockContextValue
    }
    return originalUseContext(context)
  })

  if (!loggedIn && setUpMockLocation) {
    // Allows for a redirect to the Sign In page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)?.location
    ;(window as Window).location = {
      ...originalLocation,
      href: "http://dahlia.com",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: jest.fn(),
    }
  }

  return originalUseContext
}

export const setupLocationAndRouteMock = () => {
  const originalLocation = window.location

  const customLocation = {
    ...originalLocation,
    href: "http://dahlia.com",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    toString: jest.fn(),
  }

  Object.defineProperty(window, "location", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: customLocation,
  })

  // Redefine the href setter to resolve relative URLs
  Object.defineProperty(window.location, "href", {
    configurable: true,
    enumerable: true,
    set: function (href: string) {
      const base = "http://dahlia.com"
      try {
        const newUrl = new URL(href, base)
        this._href = newUrl.href
      } catch {
        this._href = href
      }
    },
    get: function () {
      return this._href || "http://dahlia.com"
    },
  })
}
