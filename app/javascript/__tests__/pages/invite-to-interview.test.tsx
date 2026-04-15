import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToPage from "../../pages/inviteTo/invite-to"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { ConfigContext } from "../../lib/ConfigContext"
import { getListing } from "../../api/listingApiService"

jest.mock("../../api/listingApiService")
jest.mock("../../api/inviteToApplyApiService", () => ({
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
        value: "listing-id",
      },
    },
  }),
}))

const mockListing = {
  Id: "listing-id",
  Name: "Test Listing",
  Building_Name_for_Process: "Test Building",
  Leasing_Agent_Name: "test-agent",
  Leasing_Agent_Phone: "123-456-7890",
  Leasing_Agent_Email: "test-agent@test-agent.com",
  Office_Hours: "9-5 M-F",
  File_Upload_URL: "https://example.com/upload",
  translations: {},
  Listing_Images: [
    {
      Image_URL: "example-image-url",
      Image_Description: "example-image-alt",
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
  it("renders the documents page when documentsPath is true", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: "I2I",
        }}
        documentsPath={true}
      />
    )
    expect(
      screen.getByText(t("inviteToInterviewPage.documents.checkWhatYouNeed.bringDocuments.title"))
    ).toBeInTheDocument()
  })

  it("renders the deadline passed page if the deadline is passed", async () => {
    await renderWithContext(
      <InviteToPage
        assetPaths={"/"}
        urlParams={{
          type: "I2I",
          deadline: "2020-10-10",
        }}
        documentsPath={false}
      />
    )
    expect(screen.getByText(t("inviteToInterviewPage.deadlinePassed.title"))).toBeInTheDocument()
  })
})
