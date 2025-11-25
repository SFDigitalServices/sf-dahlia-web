import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToApplyPage from "../../pages/inviteToApply/invite-to-apply"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { localizedFormat } from "../../util/languageUtil"
import { getListing } from "../../api/listingApiService"

jest.mock("../../api/listingApiService")
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
  Building_Name: "Test Building",
  Leasing_Agent_Name: "test-agent",
  Leasing_Agent_Phone: "123-456-7890",
  Leasing_Agent_Email: "test-agent@test-agent.com",
  Listing_Images: [
    {
      Image_URL: "example-image-url",
      Image_Description: "example-image-alt",
    },
  ],
}

const mockPastDeadline = "2000-01-01"
const mockFutureDeadline = "3000-01-01"

describe("Invite to Apply Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)
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
  describe("Invite to Apply - user responses (deadline passed, withdrawn, contact me later)", () => {
    it("renders deadline passed card", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          deadlinePassedPath={true}
          urlParams={{
            deadline: mockPastDeadline,
          }}
        />
      )

      expect(screen.getByText(t("inviteToApplyPage.deadlinePassed.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Name)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Name)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Phone)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Leasing_Agent_Email)).toBeInTheDocument()
    })

    it("renders withdrawn card", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "no",
            applicationNumber: "0000",
          }}
        />
      )
      const submitLink = `/en/listings/${mockListing.Id}/invite-to-apply?response=yes&applicationNumber=0000&deadline=${mockFutureDeadline}`

      expect(screen.getByText(t("inviteToApplyPage.withdrawn.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Name)).toBeInTheDocument()
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.deadline", {
            day: localizedFormat(mockFutureDeadline, "ll"),
          })
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "submit an application and documents" })
      ).toHaveAttribute("href", submitLink)
    })
    it("renders contact me later card", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockFutureDeadline,
            response: "contact",
            applicationNumber: "0000",
          }}
        />
      )

      const submitLink = `/en/listings/${mockListing.Id}/invite-to-apply?response=yes&applicationNumber=0000&deadline=${mockFutureDeadline}`

      expect(
        screen.getByText(t("inviteToApplyPage.contact.title", { listingName: mockListing.Name }))
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
      ).toHaveAttribute("href", submitLink)
    })
  })

  describe("Invite to Apply - submit your information", () => {
    it("renders deadline passed banner", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            deadline: mockPastDeadline,
            response: "yes",
          }}
        />
      )
      expect(screen.getByText(t("inviteToApplyPage.submitYourInfo.p1"))).toBeInTheDocument()
    })

    it("renders submit your info banner", async () => {
      await renderAndLoadAsync(
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
    it("renders submit your info page", async () => {
      await renderAndLoadAsync(
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
          t("inviteToApplyPage.submitYourInfo.title", { listingName: mockListing.Building_Name })
        )
      ).toBeInTheDocument()
    })
    it("renders documents list page", async () => {
      await renderAndLoadAsync(
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
          t("inviteToApplyPage.documents.title", { listingName: mockListing.Building_Name })
        )
      ).toBeInTheDocument()
    })
  })
})
