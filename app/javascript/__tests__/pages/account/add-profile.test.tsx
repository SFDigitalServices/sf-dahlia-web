import React from "react"
import { useAuth } from "@clerk/react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import AddProfile from "../../../pages/account/add-profile"
import { createProfile, getProfile } from "../../../api/authApiService"
import { getDobStringFromDobObject } from "../../../util/accountUtil"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

jest.mock("../../../api/authApiService", () => ({
  ...jest.requireActual("../../../api/authApiService"),
  createProfile: jest.fn(),
  getProfile: jest.fn(),
}))

const defaultFormValues = {
  firstName: "Test",
  middleName: "Middle",
  lastName: "User",
  month: "01",
  day: "01",
  year: "2000",
}

async function fillAddProfileForm({
  firstName,
  middleName,
  lastName,
  month,
  day,
  year,
}: {
  firstName: string
  middleName?: string
  lastName: string
  month: string
  day: string
  year: string
}) {
  const firstNameField = screen.getByRole("textbox", { name: /first name/i })
  const lastNameField = screen.getByRole("textbox", { name: /last name/i })
  const monthField = screen.getByRole("spinbutton", { name: /month/i })
  const dayField = screen.getByRole("spinbutton", { name: /day/i })
  const yearField = screen.getByRole("spinbutton", { name: /year/i })

  await userEvent.clear(firstNameField)
  await userEvent.type(firstNameField, firstName)
  if (middleName) {
    const middleNameField = screen.getByRole("textbox", { name: /middle name/i })
    await userEvent.clear(middleNameField)
    await userEvent.type(middleNameField, middleName)
  }
  await userEvent.clear(lastNameField)
  await userEvent.type(lastNameField, lastName)
  await userEvent.clear(monthField)
  await userEvent.type(monthField, month)
  await userEvent.clear(dayField)
  await userEvent.type(dayField, day)
  await userEvent.clear(yearField)
  await userEvent.type(yearField, year)

  expect(firstNameField).toHaveValue(firstName)
  expect(lastNameField).toHaveValue(lastName)
  expect(monthField).toHaveValue(Number(month))
  expect(dayField).toHaveValue(Number(day))
  expect(yearField).toHaveValue(Number(year))
}

describe("<AddProfile />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockGetToken: jest.Mock
  let saveProfile: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    const mockContext = setupUserContext({ loggedIn: true, hasProfile: false })
    saveProfile = mockContext.saveProfile as jest.Mock
    mockNavigate = jest.fn()
    mockGetToken = jest.fn().mockResolvedValue("clerk-session-token")
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: mockGetToken,
    })
    ;(createProfile as jest.Mock).mockResolvedValue({ contact: { contactId: "123" } })
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)
    await renderAndLoadAsync(<AddProfile assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the add profile page", () => {
    expect(
      screen.getByRole("heading", { name: /finish setting up your account/i, level: 1 })
    ).not.toBeNull()
    expect(screen.getByText(/this info will be used to fill out your applications/i)).not.toBeNull()
    expect(screen.getByText(/enter your legal name, as it appears on your id/i)).not.toBeNull()
    expect(screen.getByRole("textbox", { name: /first name/i })).not.toBeNull()
    expect(screen.getByRole("textbox", { name: /middle name/i })).not.toBeNull()
    expect(screen.getByRole("textbox", { name: /last name/i })).not.toBeNull()
    expect(screen.getByText(/we ask for date of birth to verify your age/i)).not.toBeNull()
    expect(screen.getByText(/example: april 20, 1980 is 04 20 1980/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /finish/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
  })

  it("creates a profile and redirects to the account overview page", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})

    await fillAddProfileForm(defaultFormValues)
    await user.click(screen.getByRole("button", { name: /finish/i }))

    await waitFor(() => {
      expect(createProfile).toHaveBeenCalledWith(
        {
          firstName: "Test",
          middleName: "Middle",
          lastName: "User",
          DOB: getDobStringFromDobObject({
            birthMonth: "01",
            birthDay: "01",
            birthYear: "2000",
          }),
        },
        "clerk-session-token"
      )
    })
    expect(getProfile).toHaveBeenCalledWith("clerk-session-token")
    expect(saveProfile).toHaveBeenCalledWith(mockProfileStub)
    expect(mockNavigate).toHaveBeenCalledWith("/account", { state: { accountReady: true } })
  })

  it("shows validation errors for name fields", async () => {
    const user = userEvent.setup()
    const firstName = screen.getByRole("textbox", { name: /first name/i })
    const lastName = screen.getByRole("textbox", { name: /last name/i })

    await user.click(firstName)
    await user.click(lastName)
    await user.tab()

    expect(screen.getAllByText("Enter first name")).toHaveLength(2)
    expect(screen.getByRole("button", { name: /enter first name/i })).not.toBeNull()
    expect(screen.getAllByText("Enter last name")).toHaveLength(2)
    expect(screen.getByRole("button", { name: /enter last name/i })).not.toBeNull()
    expect(createProfile).not.toHaveBeenCalled()
  })

  it("shows validation errors for DOB field", async () => {
    const user = userEvent.setup()
    const monthField = screen.getByRole("spinbutton", { name: /month/i })
    const dayField = screen.getByRole("spinbutton", { name: /day/i })
    const yearField = screen.getByRole("spinbutton", { name: /year/i })

    await user.click(monthField)
    await user.click(dayField)
    await user.click(yearField)
    await user.tab()

    expect(screen.getByText("Enter date like: MM DD YYYY")).not.toBeNull()
    expect(screen.getByRole("button", { name: /enter date of birth/i })).not.toBeNull()

    await user.type(monthField, "15")
    await user.type(dayField, "56")
    await user.type(yearField, "3")
    await user.tab()

    expect(
      screen.getByText("Enter a valid date of birth. Enter date like: MM DD YYYY")
    ).not.toBeNull()
    expect(screen.getByRole("button", { name: /enter a valid date of birth/i })).not.toBeNull()

    await user.clear(monthField)
    await user.clear(dayField)
    await user.clear(yearField)
    await user.type(monthField, "01")
    await user.type(dayField, "01")
    await user.type(yearField, "2020")
    await user.tab()

    expect(screen.getByText(/if you are under 18, email/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /you must be 18 or older/i })).not.toBeNull()
    expect(createProfile).not.toHaveBeenCalled()
  })

  it("shows an error when creating the profile fails", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    ;(createProfile as jest.Mock).mockRejectedValue(new Error("nope"))

    await fillAddProfileForm(defaultFormValues)
    await user.click(screen.getByRole("button", { name: /finish/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /something went wrong/i })).not.toBeNull()
    })
    expect(screen.getByText(/something went wrong\. try again or check back later/i)).not.toBeNull()
    expect(saveProfile).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalledWith("/account", { state: { accountReady: true } })
  })

  it("shows an error when the Clerk session token is missing", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockGetToken.mockResolvedValue(null)

    await fillAddProfileForm(defaultFormValues)
    await user.click(screen.getByRole("button", { name: /finish/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /something went wrong/i })).not.toBeNull()
    })
    expect(createProfile).not.toHaveBeenCalled()
    expect(saveProfile).not.toHaveBeenCalled()
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<AddProfile assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("redirects to sign-in when the user is not signed in", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: false })
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken: mockGetToken,
    })
    await renderAndLoadAsync(<AddProfile assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("does not redirect when the user is signed in without a profile", () => {
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(
      screen.getByRole("heading", { name: /finish setting up your account/i, level: 1 })
    ).not.toBeNull()
  })

  it("redirects to account when the user has already set up their profile", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true })
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: mockGetToken,
    })
    await renderAndLoadAsync(<AddProfile assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })
  })
})
