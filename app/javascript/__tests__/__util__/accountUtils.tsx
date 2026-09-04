import React from "react"
import { useAuth } from "@clerk/clerk-react"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { User } from "../../authentication/user"
import * as authApiService from "../../api/authApiService"
import {
  Session,
  SessionContext,
  SessionContextValue,
  SessionProviderKind,
  SessionStatus,
} from "../../authentication/session"

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

const buildSession = (loggedIn: boolean, profile: ContextProps["profile"]): Session => {
  if (!loggedIn) {
    return { status: SessionStatus.SignedOut }
  }
  if (!profile) {
    // Only reachable under Clerk, but tests drive it directly via hasProfile.
    return { status: SessionStatus.SignedInWithoutProfile, userId: "clerk-user-id" }
  }
  return { status: SessionStatus.SignedIn, userId: String(profile.id), profile }
}

export const setupUserContext = ({
  loggedIn,
  mockProfile = mockProfileStub,
  hasProfile = loggedIn,
  clerkEnabled = true,
}: {
  loggedIn: boolean
  mockProfile?: ContextProps["profile"]
  hasProfile?: boolean
  /**
   * Which backend the stubbed session facade reports. Defaults to Clerk,
   * matching the suites that reach for this helper: they mock the Clerk flag on.
   * Pass false to exercise a Devise-only branch.
   */
  clerkEnabled?: boolean
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

  const mockSessionValue = (): SessionContextValue => ({
    session: buildSession(loggedIn, mockContextValue.profile),
    provider: clerkEnabled ? SessionProviderKind.Clerk : SessionProviderKind.Devise,
    hasCredentials: loggedIn,
    signOut: mockContextValue.signOut as () => Promise<void>,
    timeOut: mockContextValue.timeOut as () => Promise<void>,
    getToken: () => Promise.resolve("clerk-session-token"),
  })

  jest.spyOn(React, "useContext").mockImplementation((context) => {
    if (context === UserContext) {
      return mockContextValue
    }
    // Components ask the session facade rather than UserContext directly, so it
    // has to be stubbed here too or they see the default Loading session.
    if (context === SessionContext) {
      return mockSessionValue()
    }
    return originalUseContext(context)
  })

  if (jest.isMockFunction(useAuth)) {
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: loggedIn,
      signOut: jest.fn(),
      getToken: jest.fn().mockResolvedValue("clerk-session-token"),
    })
  }

  if (loggedIn) {
    if (jest.isMockFunction(authApiService.getProfile)) {
      authApiService.getProfile.mockResolvedValue(mockProfile ?? mockProfileStub)
    } else {
      jest.spyOn(authApiService, "getProfile").mockResolvedValue(mockProfile ?? mockProfileStub)
    }
  }

  return mockContextValue
}
