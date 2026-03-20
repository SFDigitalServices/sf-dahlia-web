import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ListingApplyIntro from "../../../../pages/form/components/ListingApplyIntro"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyIntro", () => {
  it("renders", () => {
    renderWithFormContextWrapper(<ListingApplyIntro />, { renderForm: false })

    expect(screen.getByText(t("a1Intro.title"))).not.toBeNull()
    expect(screen.getByText(openRentalListing.Name)).not.toBeNull()
    expect(screen.getByText("Begin")).not.toBeNull()
    expect(screen.getByText("Empezar")).not.toBeNull()
    expect(screen.getByText("開始")).not.toBeNull()
    expect(screen.getByText("Magsimula")).not.toBeNull()
  })

  it("calls handleNextStep when a language button is clicked", async () => {
    const { mockHandleNextStep } = renderWithFormContextWrapper(<ListingApplyIntro />, {
      renderForm: false,
    })
    const user = userEvent.setup()

    await user.click(screen.getByText("Begin"))
    expect(mockHandleNextStep).toHaveBeenCalled()
    await user.click(screen.getByText("Empezar"))
    expect(mockHandleNextStep).toHaveBeenCalled()
    await user.click(screen.getByText("開始"))
    expect(mockHandleNextStep).toHaveBeenCalled()
    await user.click(screen.getByText("Magsimula"))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("uses listing imageURL when no Listing_Images exist", () => {
    renderWithFormContextWrapper(<ListingApplyIntro />, {
      renderForm: false,
      staticData: {
        listing: {
          ...openRentalListing,
          Listing_Images: [],
          imageURL: "https://example.com/listing-image.jpg",
        },
      },
    })

    const imgs = screen.getAllByAltText(openRentalListing.Name)
    const fallbackImgEl = imgs[imgs.length - 1]
    expect(fallbackImgEl.getAttribute("src")).toBe("https://example.com/listing-image.jpg")
  })
})
