import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import { userEvent } from "@testing-library/user-event"
import InviteToPage from "../../pages/inviteTo/invite-to"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { ConfigContext } from "../../lib/ConfigContext"
import { getListing } from "../../api/listingApiService"
import { recordResponse } from "../../api/inviteToApiService"
import { INVITE_TO_X } from "../../modules/constants"

jest.mock("../../api/listingApiService")
jest.mock("../../api/inviteToApiService", () => ({
  recordResponse: jest.fn(),
}))
jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isEnabled: true,
    isLoading: false,
    unleashFlag: true,
  }),
  useVariantFlag: () => ({
    isEnabled: true,
    isLoading: false,
    unleashFlag: true,
    variant: {
      payload: {
        value: JSON.stringify({ enabled_listings: ["listing-id"] }),
      },
    },
  }),
}))

const mockListing = {
  Id: "listing-id",
  Name: "Test Listing",
  Building_Name_for_Process: "Test Building",
  Leaseup_Appointment_Scheduling_URL: "test-link",
  Leasing_Agent_Name: "test-agent",
  Leasing_Agent_Phone: "123-456-7890",
  Leasing_Agent_Email: "test-agent@test-agent.com",
  Office_Hours: "9-5 M-F",
  translations: {},
  Listing_Images: [
    {
      Image_URL: "image-url",
      Image_Description: "image-alt",
    },
  ],
}

const mockConfigContext = {
  getAssetPath: jest.fn((path) => `/assets/${path}`),
  assetPaths: {},
  listingsAlertUrl: "/",
}

const renderWithContext = async (component: React.ReactElement) => {
  return renderAndLoadAsync(
    <ConfigContext.Provider value={mockConfigContext}>{component}</ConfigContext.Provider>
  )
}

describe("Invite to Interview", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)
    jest.spyOn(console, "error").mockImplementation(() => {})
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
  it("renders the documents page", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
        }}
        documentsPath={true}
      />
    )
    expect(
      screen.getByText(t("inviteToInterviewPage.documents.checkWhatYouNeed.title"))
    ).toBeInTheDocument()
  })

  it("renders the next steps page", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "yes",
          deadline: "2030-10-10",
          appId: "test-id",
        }}
        documentsPath={false}
      />
    )
    expect(screen.getByText(t("inviteToInterviewPage.submitYourInfo.subtitle"))).toBeInTheDocument()
  })

  it("shows the deadline passed banner if deadline is passed", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "yes",
          deadline: "2020-10-10",
          appId: "test-id",
        }}
      />
    )
    expect(screen.getByTestId("deadline-passed-banner")).toBeInTheDocument()
  })

  it("shows the deadline banner when deadline is not passed", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "yes",
          deadline: "2030-10-10",
          appId: "test-id",
        }}
      />
    )
    expect(screen.getByTestId("deadline-not-passed-banner")).toBeInTheDocument()
  })

  it("records the response when the scheduling button is clicked", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          deadline: "2030-10-10",
          inviteAction: "yes",
          appId: "test-id",
        }}
      />
    )
    const button = screen.getByRole("button", {
      name: t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p2"),
    })
    await userEvent.click(button)
    expect(recordResponse).toHaveBeenCalled()
  })

  it("shows the withdrawn page when the action is no", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "no",
          deadline: "2030-10-10",
          appId: "test-id",
        }}
      />
    )
    expect(screen.getByText(t("inviteToInterviewPage.withdrawn.title"))).toBeInTheDocument()
  })
  it("shows the withdrawn page without the body when the deadline is passed", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "no",
          deadline: "2020-10-10",
          appId: "test-id",
        }}
      />
    )
    expect(screen.queryByText(t("inviteToInterviewPage.withdrawn.body"))).not.toBeInTheDocument()
  })
  it("shows the waitlist page when the action is contact", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: INVITE_TO_X.INTERVIEW,
          inviteAction: "contact",
          deadline: "2030-10-10",
          appId: "test-id",
        }}
      />
    )
    expect(screen.getByText(t("inviteToInterviewPage.waitlist.title"))).toBeInTheDocument()
  })
})
