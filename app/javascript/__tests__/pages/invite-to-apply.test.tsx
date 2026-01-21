import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToApplyPage from "../../pages/inviteToApply/invite-to-apply"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { localizedFormat } from "../../util/languageUtil"
import { getListing } from "../../api/listingApiService"
import { getApplication, recordResponse } from "../../api/inviteToApplyApiService"
import { ConfigContext } from "../../lib/ConfigContext"

jest.mock("../../api/listingApiService")
jest.mock("../../api/inviteToApplyApiService", () => ({
  recordResponse: jest.fn(),
  getApplication: jest.fn(),
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

const mockPastDeadline = "2000-01-01"
const mockFutureDeadline = "3000-01-01"

describe("Invite to Apply Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)
    ;(getApplication as jest.Mock).mockResolvedValue({
      data: { fileUploadUrl: "www.file-upload-url.com" },
    })

    // Mock console.error to suppress expected errors during tests
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
    // Restore console.error after each test
    jest.restoreAllMocks()
  })
  describe("Invite to Apply - user responses (deadline passed, withdrawn, contact me later)", () => {
    it("renders deadline passed card", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            response: "yes",
            deadline: mockPastDeadline,
          }}
        />
      )

      expect(screen.getByText(t("inviteToApplyPage.deadlinePassed.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Building_Name_for_Process)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Name)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Phone)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Email)).toBeInTheDocument()
    })

    it("renders withdrawn card", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "no",
            applicationNumber: "0000",
          }}
        />
      )
      const submitPreviewLink = `/en/listings/${mockListing.Id}/invite-to-apply?applicationNumber=0000&deadline=${mockFutureDeadline}`

      expect(screen.getByText(t("inviteToApplyPage.withdrawn.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Building_Name_for_Process)).toBeInTheDocument()
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.deadline", {
            day: localizedFormat(mockFutureDeadline, "ll"),
          })
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "submit an application and documents" })
      ).toHaveAttribute("href", submitPreviewLink)
    })

    it("renders contact me later card", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "contact",
            applicationNumber: "0000",
          }}
        />
      )

      const submitPreviewLink = `/en/listings/${mockListing.Id}/invite-to-apply?applicationNumber=0000&deadline=${mockFutureDeadline}`

      expect(
        screen.getByText(
          t("inviteToApplyPage.contact.title", {
            listingName: mockListing.Building_Name_for_Process,
          })
        )
      ).toBeInTheDocument()
      expect(screen.getByText(t("inviteToApplyPage.contact.subtitle"))).toBeInTheDocument()
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.deadline", {
            day: localizedFormat(mockFutureDeadline, "ll"),
          })
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "submit an application and documents" })
      ).toHaveAttribute("href", submitPreviewLink)
    })
  })

  describe("Invite to Apply - submit your information", () => {
    it("renders deadline passed banner", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockPastDeadline,
          }}
        />
      )
      expect(screen.getByTestId("deadline-passed-banner")).not.toBeNull()
    })

    it("renders submit your info banner", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.deadline", {
            day: localizedFormat(mockFutureDeadline, "ll"),
          })
        )
      ).toBeInTheDocument()
    })

    it("renders submit your info button which calls API to record the response", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
            applicationNumber: "a0o123",
          }}
        />
      )
      await userEvent.click(
        screen.getByRole("button", {
          name: t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4"),
        })
      )
      expect(recordResponse).toHaveBeenCalled()
    })

    it("renders submit your info page", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.title", {
            listingName: mockListing.Building_Name_for_Process,
          })
        )
      ).toBeInTheDocument()
    })

    it("gets the file upload URL", async () => {
      window.open = jest.fn()
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
          }}
        />
      )
      await userEvent.click(
        screen.getByRole("button", {
          name: t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4"),
        })
      )
      expect(getApplication).toHaveBeenCalled()
      expect(window.open).toHaveBeenCalledWith("www.file-upload-url.com", "_blank")
    })

    it("renders documents list page", async () => {
      await renderWithContext(
        <InviteToApplyPage
          assetPaths={"/"}
          documentsPath={true}
          urlParams={{
            deadline: mockFutureDeadline,
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToApplyPage.documents.title", {
            listingName: mockListing.Building_Name_for_Process,
          })
        )
      ).toBeInTheDocument()
    })
  })
})
