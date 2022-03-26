import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsAside } from "../../../modules/listingDetails/ListingDetailsAside"

describe("Listing Details Aside", () => {
  it("displays Application Deadline when due date has not passed", () => {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const tree = renderer
      .create(
        <ListingDetailsAside
          listing={{ Application_Due_Date: "2050-01-01T01:00:00.000+0000" } as any}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("displays Applications Closed when due date has passed", () => {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const tree = renderer
      .create(
        <ListingDetailsAside
          listing={{ Application_Due_Date: "2000-01-01T01:00:00.000+0000" } as any}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
