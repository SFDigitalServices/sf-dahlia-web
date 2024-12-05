import React from "react"
import { render, screen } from "@testing-library/react"
import { getApplicationPath } from "../../util/routeUtil"
import { applicationWithOpenListing } from "../data/RailsApplication/application-with-open-listing"
import { ApplicationItem } from "../../components/ApplicationItem"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { localizedFormat } from "../../util/languageUtil"

jest.mock("../../api/listingApiService", () => ({
  getLotteryBucketDetails: () =>
    Promise.resolve({
      URL: null,
      publishLotteryResultsDAHLIA: "Publish results in lottery modal on DAHLIA",
      publishLotteryResults: true,
      officeHours: null,
      lotteryStatus: "Lottery Complete",
      lotteryResultsURL: null,
      lotteryPreferences: null,
      lotteryEndTime: null,
      lotteryDate: "2022-01-13T20:00:00.000Z",
      lotteryCity: "San Francisco",
      lotteryBuckets: [
        {
          unitsAvailable: 3,
          totalSubmittedApps: 3,
          preferenceShortCode: "COP",
          preferenceResults: [],
          preferenceOrder: 1,
          preferenceName: "Certificate of Preference (COP)",
        },
        {
          unitsAvailable: 2,
          totalSubmittedApps: 3,
          preferenceShortCode: "DTHP",
          preferenceResults: [],
          preferenceOrder: 2,
          preferenceName: "Displaced Tenant Housing Preference (DTHP)",
        },
        {
          unitsAvailable: 3,
          totalSubmittedApps: 6,
          preferenceShortCode: "L_W",
          preferenceResults: [],
          preferenceOrder: 3,
          preferenceName: "Live or Work in San Francisco Preference",
        },
        {
          unitsAvailable: 3,
          totalSubmittedApps: 1,
          preferenceShortCode: null,
          preferenceResults: [
            {
              preferenceRank: null,
              lotteryRank: 8,
              lotteryNumber: "01517927",
              applicationID: "a0o6s000001d0TMAAY",
            },
          ],
          preferenceOrder: null,
          preferenceName: "generalLottery",
        },
      ],
      lotteryAppTotal: 8,
      listingId: "a0W4U00000IhGZcUAN",
    }),
}))

const generateFutureDate = () => {
  const dateObj = new Date()
  dateObj.setFullYear(dateObj.getFullYear() + 1) // Set the year to next year

  const year = dateObj.getFullYear()
  const month = ("0" + (dateObj.getMonth() + 1)).slice(-2) // Months are 0-indexed in JS
  const day = ("0" + dateObj.getDate()).slice(-2)

  return `${year}-${month}-${day}`
}

describe("Application Item", () => {
  it("displays a correct application item for an application to an open listing", () => {
    const futureDate = generateFutureDate()
    const readableDate = localizedFormat(futureDate, "LL")
    render(
      <ApplicationItem
        applicationURL={`${getApplicationPath()}/${applicationWithOpenListing.id}`}
        applicationUpdatedAt={applicationWithOpenListing.applicationSubmittedDate}
        confirmationNumber={applicationWithOpenListing.lotteryNumber.toString()}
        editedDate={applicationWithOpenListing.applicationSubmittedDate}
        submitted={applicationWithOpenListing.status === "Submitted"}
        listing={{
          ...applicationWithOpenListing.listing,
          Application_Due_Date: futureDate,
        }}
      />
    )

    expect(screen.getByText(/681 florida st, san francisco, ca 94110/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(readableDate, "i"))).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /view application/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /delete/i })).not.toBeInTheDocument()
  })

  it("displays a correct application item for an in progress application to an open listing", () => {
    const futureDate = generateFutureDate()
    const readableDate = localizedFormat(futureDate, "LL")
    render(
      <ApplicationItem
        applicationURL={`${getApplicationPath()}/${applicationWithOpenListing.id}`}
        applicationUpdatedAt={applicationWithOpenListing.applicationSubmittedDate}
        confirmationNumber={applicationWithOpenListing.lotteryNumber.toString()}
        editedDate={applicationWithOpenListing.applicationSubmittedDate}
        submitted={false}
        listing={{
          ...applicationWithOpenListing.listing,
          Application_Due_Date: futureDate,
        }}
      />
    )

    expect(screen.getByText(/681 florida st, san francisco, ca 94110/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(readableDate, "i"))).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /continue application/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /see listing/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /delete/i })).toBeInTheDocument()
    expect(screen.queryByText(/Your lottery number is/i)).not.toBeInTheDocument()
  })

  it("displays a correct application item for an application to a listing with a completed lottery", async () => {
    const futureDate = generateFutureDate()
    const readableDate = localizedFormat(futureDate, "LL")

    await renderAndLoadAsync(
      <ApplicationItem
        applicationURL={`${getApplicationPath()}/${applicationWithOpenListing.id}`}
        applicationUpdatedAt={applicationWithOpenListing.applicationSubmittedDate}
        confirmationNumber={applicationWithOpenListing.lotteryNumber.toString()}
        editedDate={applicationWithOpenListing.applicationSubmittedDate}
        submitted={applicationWithOpenListing.status === "Submitted"}
        listing={{
          ...applicationWithOpenListing.listing,
          Application_Due_Date: futureDate,
          Publish_Lottery_Results_on_DAHLIA: "Publish results in lottery modal on DAHLIA",
          Lottery_Status: "Lottery Complete",
        }}
      />
    )

    expect(screen.getByText(/681 florida st, san francisco, ca 94110/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(readableDate, "i"))).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /view lottery results/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /see listing/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /delete/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Your lottery number is/i)).toBeInTheDocument()
  })
})
