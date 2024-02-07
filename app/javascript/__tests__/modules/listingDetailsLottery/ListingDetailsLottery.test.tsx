import React from "react"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { screen } from "@testing-library/react"
import { MobileListingDetailsLottery } from "../../../modules/listingDetailsLottery/MobileListingDetailsLottery"

describe("ListingDetailsLottery", () => {
  it("does not display if lottery is not complete", async () => {
    await renderAndLoadAsync(
      <MobileListingDetailsLottery listing={openSaleListing} imageSrc={"/test.jpg"} />
    )
    const subheader = screen.queryByText("Lottery selection, important dates and contact")

    expect(subheader).not.toBeInTheDocument()
  })
})
