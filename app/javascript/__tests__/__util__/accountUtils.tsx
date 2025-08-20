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
  mockProfile = mockProfileStub,
}: {
  loggedIn: boolean
  mockProfile?: ContextProps["profile"]
}): ContextProps => {
  const mockContextValue: ContextProps = {
    profile: loggedIn ? mockProfile : undefined,
    signIn: jest.fn(),
    signOut: jest.fn(),
    timeOut: jest.fn(),
    saveProfile: jest.fn(),
    loading: false,
    initialStateLoaded: true,
  }

  const originalUseContext = React.useContext

  jest.spyOn(React, "useContext").mockImplementation((context) => {
    if (context === UserContext) {
      return mockContextValue
    }
    return originalUseContext(context)
  })

  return mockContextValue
}
