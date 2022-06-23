import React from "react"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { screen } from "@testing-library/react"
import { ListingDetailsLottery } from "../../../modules/listingDetailsLottery/ListingDetailsLottery"

describe("ListingDetailsLottery", () => {
  it("does not display if lottery is not complete", async () => {
    await renderAndLoadAsync(
      <ListingDetailsLottery listing={openSaleListing} imageSrc={"/test.jpg"} />
    )
    const subheader = screen.queryByText("Lottery selection, important dates and contact")

    expect(subheader).not.toBeInTheDocument()
  })
})
