import React from "react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { t } from "@bloom-housing/ui-components"
import InviteToApplyPage from "../../../../javascript/pages/inviteToApply/invite-to-apply"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { formatTimeOfDay, localizedFormat } from "../../../util/languageUtil"
import { getListing } from "../../../api/listingApiService"

jest.mock("../../../api/listingApiService")

const mockListing = {
  Id: "listing-id",
  Name: "Test Listing",
  Leasing_Agent_Name: "test-agent",
  Leasing_Agent_Phone: "123-456-7890",
  Leasing_Agent_Email: "test-agent@test-agent.com",
}
const mockPastDeadline = "2000-01-01"
const mockFutureDeadline = "3000-01-01"

describe("Invite to Apply Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.clearAllMocks()
    ;(getListing as jest.Mock).mockResolvedValue(mockListing)
  })

  describe("Invite to Apply - deadline passed", () => {
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
    expect(screen.getByText(t("inviteToApplyPage.deadlinePassed.banner"))).toBeInTheDocument()
    const formattedDate = t("myApplications.applicationDeadlineTime", {
      date: localizedFormat(mockPastDeadline, "ll"),
      time: formatTimeOfDay(mockPastDeadline),
    })
    expect(screen.getByText(formattedDate)).toBeInTheDocument()
  })
})
  describe("Invite to Apply - withdrawn", () => {
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
      expect(screen.getByRole('link', { name: "submit an application and documents" })).toHaveAttribute('href', submitLink)
    })
  })
})
