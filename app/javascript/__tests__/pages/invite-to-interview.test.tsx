import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToInterviewPage from "../../pages/inviteToApply/invite-to-interview"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { localizedFormat } from "../../util/languageUtil"
import { getListing } from "../../api/listingApiService"
import { ConfigContext } from "../../lib/ConfigContext"

jest.mock("../../api/listingApiService")
jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isEnabled: true,
    isLoading: false,
    unleashFlag: true,
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

describe("Invite to Interview Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)

    jest.spyOn(console, "error").mockImplementation(() => {})
    jest.spyOn(console, "warn").mockImplementation(() => {})

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

  describe("user responses (deadline passed, withdrawn, contact me later)", () => {
    it("renders deadline passed card", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            response: "yes",
            deadline: mockPastDeadline,
          }}
        />
      )

      expect(screen.getByText(t("inviteToInterviewPage.deadlinePassed.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Building_Name_for_Process)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Name)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Phone)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Email)).toBeInTheDocument()
    })

    it("renders withdrawn card", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "no",
            applicationNumber: "0000",
          }}
        />
      )

      expect(screen.getByText(t("inviteToInterviewPage.withdrawn.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Building_Name_for_Process)).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "come to an appointment and submit more documents" })
      ).toBeInTheDocument()
    })

    it("renders contact me later card", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "contact",
            applicationNumber: "0000",
          }}
        />
      )

      expect(
        screen.getByText(t("inviteToInterviewPage.waitlist.title"))
      ).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "come to an appointment and submit more documents" })
      ).toBeInTheDocument()
    })
  })

  describe("submit your info page", () => {
    it("renders deadline passed banner when deadline has passed", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockPastDeadline,
          }}
        />
      )
      expect(screen.getByTestId("deadline-passed-banner")).not.toBeNull()
    })

    it("renders schedule by deadline banner when deadline is active", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToInterviewPage.submitYourInfo.deadline", {
            day: localizedFormat(mockFutureDeadline, "ll"),
          })
        )
      ).toBeInTheDocument()
    })

    it("renders submit your info page with listing name", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getAllByText(mockListing.Building_Name_for_Process).length
      ).toBeGreaterThanOrEqual(1)
    })

    it("renders what to do section with three steps", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByText(t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.title"))
      ).toBeInTheDocument()
      expect(
        screen.getByText(t("inviteToInterviewPage.submitYourInfo.whatToDo.step2.title"))
      ).toBeInTheDocument()
      expect(
        screen.getByText(t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.title"))
      ).toBeInTheDocument()
    })

    it("renders schedule appointment button when deadline is active", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByRole("button", {
          name: t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p2"),
        })
      ).toBeInTheDocument()
    })

    it("hides schedule appointment button when deadline has passed", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockPastDeadline,
          }}
        />
      )
      expect(
        screen.queryByRole("button", {
          name: t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p2"),
        })
      ).not.toBeInTheDocument()
    })

    it("renders documents list page", async () => {
      await renderWithContext(
        <InviteToInterviewPage
          assetPaths={"/"}
          documentsPath={true}
          urlParams={{
            deadline: mockFutureDeadline,
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToInterviewPage.documents.title", {
            listingName: mockListing.Building_Name_for_Process,
          })
        )
      ).toBeInTheDocument()
    })
  })
})
