import React from "react"
import { useAuth } from "@clerk/clerk-react"
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
  phone: "111-111-1111",
  phoneType: "Home",
  alternatePhone: "222-222-2222",
  alternatePhoneType: "Cell",
  housingCounselingAgencyId: null,
}

export const setupUserContext = ({
  loggedIn,
  mockProfile = mockProfileStub,
  hasProfile = loggedIn,
}: {
  loggedIn: boolean
  mockProfile?: ContextProps["profile"]
  hasProfile?: boolean
}): ContextProps => {
  const mockContextValue: ContextProps = {
    profile: hasProfile ? mockProfile : undefined,
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

  if (jest.isMockFunction(useAuth)) {
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: loggedIn, signOut: jest.fn() })
  }

  return mockContextValue
}
