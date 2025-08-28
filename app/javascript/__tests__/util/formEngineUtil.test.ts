import { translationFromDataSchema } from "../../util/formEngineUtil"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"

describe("formEngineUtil", () => {
  describe("translationFromDataSchema", () => {
    it("supports translations with variables from a formSchema", () => {
      const translationKey = "label.forUser"
      const translationVars = { user: { dataSource: "form", dataKey: "userName" } }
      const dataSources = {
        formData: { userName: "Jane" },
        listingData: openRentalListing,
      }
      expect(translationFromDataSchema(translationKey, translationVars, dataSources)).toBe(
        "for Jane"
      )
    })
  })
})
