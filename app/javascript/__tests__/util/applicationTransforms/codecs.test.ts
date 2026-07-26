import {
  checkboxToBoolean,
  dateOfBirth,
  identity,
  number,
  pickList,
  streetAndUnit,
  text,
  yesNoToBoolean,
  yesNoToBooleanString,
} from "../../../util/applicationTransforms/codecs"

describe("application transform codecs", () => {
  describe("identity", () => {
    it("drops empty values on the way out", () => {
      expect(identity.toSf(null)).toBeUndefined()
      expect(identity.toSf("")).toBeUndefined()
      expect(identity.toSf("Home")).toBe("Home")
    })

    it("normalizes missing values to an empty string on the way in", () => {
      expect(identity.fromSf(undefined)).toBe("")
      expect(identity.fromSf(null)).toBe("")
      expect(identity.fromSf("Home")).toBe("Home")
    })
  })

  describe("text", () => {
    it("trims and drops blank strings", () => {
      expect(text.toSf("  Alice  ")).toBe("Alice")
      expect(text.toSf("   ")).toBeUndefined()
      expect(text.toSf(undefined)).toBeUndefined()
    })
  })

  describe("yesNoToBooleanString", () => {
    it("converts to the strings Salesforce expects", () => {
      expect(yesNoToBooleanString.toSf("Yes")).toBe("true")
      expect(yesNoToBooleanString.toSf("No")).toBe("false")
    })

    it("treats anything else as unanswered", () => {
      expect(yesNoToBooleanString.toSf(null)).toBeUndefined()
      expect(yesNoToBooleanString.toSf("")).toBeUndefined()
    })

    it("round-trips both answers", () => {
      expect(yesNoToBooleanString.fromSf(yesNoToBooleanString.toSf("Yes"))).toBe("Yes")
      expect(yesNoToBooleanString.fromSf(yesNoToBooleanString.toSf("No"))).toBe("No")
    })

    it("returns null for an unset Salesforce value", () => {
      expect(yesNoToBooleanString.fromSf(undefined)).toBeNull()
    })
  })

  describe("yesNoToBoolean", () => {
    it("round-trips both answers", () => {
      expect(yesNoToBoolean.toSf("Yes")).toBe(true)
      expect(yesNoToBoolean.toSf("No")).toBe(false)
      expect(yesNoToBoolean.fromSf(true)).toBe("Yes")
      expect(yesNoToBoolean.fromSf(false)).toBe("No")
      expect(yesNoToBoolean.fromSf(undefined)).toBeNull()
    })
  })

  describe("checkboxToBoolean", () => {
    it("coerces truthiness", () => {
      expect(checkboxToBoolean.toSf(true)).toBe(true)
      expect(checkboxToBoolean.toSf(false)).toBe(false)
      expect(checkboxToBoolean.fromSf(true)).toBe(true)
      expect(checkboxToBoolean.fromSf(undefined)).toBe(false)
    })

    it("omits a checkbox the applicant never saw", () => {
      expect(checkboxToBoolean.toSf(undefined)).toBeUndefined()
      expect(checkboxToBoolean.toSf(null)).toBeUndefined()
    })
  })

  describe("pickList", () => {
    it("builds a semicolon-terminated list", () => {
      expect(pickList.toSf(["Adaptable", "Vision impairments"])).toBe(
        "Adaptable;Vision impairments;"
      )
    })

    it("omits an empty selection", () => {
      expect(pickList.toSf([])).toBeUndefined()
      expect(pickList.toSf(undefined)).toBeUndefined()
    })

    it("parses a list back into an array", () => {
      expect(pickList.fromSf("Adaptable;Vision impairments;")).toEqual([
        "Adaptable",
        "Vision impairments",
      ])
    })

    it("returns an empty array for no selection", () => {
      expect(pickList.fromSf(undefined)).toEqual([])
      expect(pickList.fromSf("")).toEqual([])
    })

    it("round-trips", () => {
      const selected = ["Asian - Chinese", "White - European"]
      expect(pickList.fromSf(pickList.toSf(selected))).toEqual(selected)
    })
  })

  describe("number", () => {
    it("strips currency formatting", () => {
      expect(number.toSf("$1,250")).toBe(1250)
      expect(number.toSf("1250")).toBe(1250)
    })

    it("omits blank and unparseable values", () => {
      expect(number.toSf("")).toBeUndefined()
      expect(number.toSf(null)).toBeUndefined()
      expect(number.toSf("not a number")).toBeUndefined()
    })

    it("round-trips", () => {
      expect(number.fromSf(number.toSf("1250"))).toBe("1250")
    })
  })

  describe("dateOfBirth", () => {
    it("zero-pads into a Salesforce date", () => {
      expect(dateOfBirth.toSf(["1985", "6", "5"])).toBe("1985-06-05")
    })

    it("omits an incomplete date", () => {
      expect(dateOfBirth.toSf(["1985", "6", ""])).toBeUndefined()
      expect(dateOfBirth.toSf(["", "", ""])).toBeUndefined()
    })

    it("omits an impossible date", () => {
      expect(dateOfBirth.toSf(["1985", "2", "30"])).toBeUndefined()
    })

    it("splits a Salesforce date back into three inputs", () => {
      expect(dateOfBirth.fromSf("1985-06-05")).toEqual(["1985", "06", "05"])
    })

    it("returns empty inputs when there is no date", () => {
      expect(dateOfBirth.fromSf(undefined)).toEqual(["", "", ""])
    })

    it("round-trips a padded date", () => {
      expect(dateOfBirth.toSf(dateOfBirth.fromSf("1985-06-05"))).toBe("1985-06-05")
    })
  })

  describe("streetAndUnit", () => {
    it("joins the street and unit", () => {
      expect(streetAndUnit.toSf(["1 Main St", "Apt 2"])).toBe("1 Main St Apt 2")
    })

    it("handles a missing unit", () => {
      expect(streetAndUnit.toSf(["1 Main St", ""])).toBe("1 Main St")
      expect(streetAndUnit.toSf(["", ""])).toBeUndefined()
    })

    // documented lossiness: the unit boundary is not recoverable
    it("returns the whole string as the street, with no unit", () => {
      expect(streetAndUnit.fromSf("1 Main St Apt 2")).toEqual(["1 Main St Apt 2", ""])
    })
  })
})
