import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToApplyPage from "../../pages/inviteToApply/invite-to-apply"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { formatTimeOfDay, getApplicationDeadline, localizedFormat } from "../../util/languageUtil"
import { getListing } from "../../api/listingApiService"

jest.mock("../../api/listingApiService")

const mockListing = {
  Id: "listing-id",
  Name: "Test Listing",
  Leasing_Agent_Name: "test-agent",
  Leasing_Agent_Phone: "123-456-7890",
  Leasing_Agent_Email: "test-agent@test-agent.com",
  Listing_Images: [
    {
      Image_URL: "example-image-url",
      Image_Description: "example-image-alt",
    },
  ],
  Building_Street_Address: "test-address",
}
const mockPastDeadline = "2000-01-01"
const mockFutureDeadline = "3000-01-01"

describe("Invite to Apply Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)
  })
  describe("Invite to Apply - user responses (deadline passed, withdrawn, contact me later)", () => {
    it("renders deadline passed card", async () => {
      Object.defineProperty(window, "location", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: { ...window.location, pathname: "/invite-to-apply/deadline-passed" },
      })

      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            listing: mockListing.Id,
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
            listing: mockListing.Id,
            deadline: mockFutureDeadline,
            response: "no",
            applicationNumber: "0000",
          }}
        />
      )

      const formattedDate = t("myApplications.applicationDeadlineTime", {
        date: localizedFormat(mockFutureDeadline, "ll"),
        time: formatTimeOfDay(mockFutureDeadline),
      })

      const submitLink = `/invite-to-apply?response=no&applicationNumber=0000&deadline=${mockFutureDeadline}&listingId=${mockListing.Id}`

      expect(screen.getByText(t("inviteToApplyPage.withdrawn.title"))).toBeInTheDocument()
      expect(screen.getByText(mockListing.Name)).toBeInTheDocument()
      expect(screen.getByText(formattedDate)).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "submit an application and documents" })
      ).toHaveAttribute("href", submitLink)
    })
    it("renders contact me later card", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            listing: mockListing.Id,
            deadline: mockFutureDeadline,
            response: "contact",
            applicationNumber: "0000",
          }}
        />
      )

      const formattedDate = t("myApplications.applicationDeadlineTime", {
        date: localizedFormat(mockFutureDeadline, "ll"),
        time: formatTimeOfDay(mockFutureDeadline),
      })

      const submitLink = `/invite-to-apply?response=contact&applicationNumber=0000&deadline=${mockFutureDeadline}&listingId=${mockListing.Id}`

      expect(
        screen.getByText(t("inviteToApplyPage.contact.title", { listingName: mockListing.Name }))
      ).toBeInTheDocument()
      expect(screen.getByText(t("inviteToApplyPage.contact.subtitle"))).toBeInTheDocument()
      expect(screen.getByText(formattedDate)).toBeInTheDocument()
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
            listing: mockListing.Id,
            deadline: mockPastDeadline,
            response: "yes",
          }}
        />
      )
      expect(screen.getByText(getApplicationDeadline(mockPastDeadline))).toBeInTheDocument()
    })

    it("renders submit your info banner", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            listing: mockListing.Id,
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(screen.getByText(getApplicationDeadline(mockFutureDeadline))).toBeInTheDocument()
    })
    it("renders listing details", async () => {
      await renderAndLoadAsync(
        <InviteToApplyPage
          assetPaths={"/"}
          urlParams={{
            listing: mockListing.Id,
            deadline: mockFutureDeadline,
            response: "yes",
          }}
        />
      )
      expect(
        screen.getByText(
          t("inviteToApplyPage.submitYourInfo.title", { listingName: mockListing.Name })
        )
      ).toBeInTheDocument()
      expect(screen.getByText(mockListing.Name)).toBeInTheDocument()
      expect(screen.getByText(mockListing.Building_Street_Address)).toBeInTheDocument()
      expect(screen.getByRole("img")).toBeInTheDocument()
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        mockListing.Listing_Images?.[0]?.Image_URL
      )
      expect(screen.getByRole("img")).toHaveAttribute(
        "alt",
        mockListing.Listing_Images?.[0]?.Image_Description
      )
    })
  })
})
