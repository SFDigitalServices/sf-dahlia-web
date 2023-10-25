import {
  getCurrentLanguage,
  getPathWithoutLanguagePrefix,
  getRoutePrefix,
  LanguagePrefix,
  toLanguagePrefix,
  getReservedCommunityType,
  defaultIfNotTranslated,
  localizedFormat,
  getCustomListingType,
  getSfGovUrl,
} from "../../util/languageUtil"

describe("languageUtil", () => {
  describe("toLanguagePrefix", () => {
    it("returns the correct prefix when a blank or invalid string is provided", () => {
      expect(toLanguagePrefix("")).toBe(LanguagePrefix.English)
      expect(toLanguagePrefix("abc")).toBe(LanguagePrefix.English)
    })

    it("returns the correct prefix", () => {
      expect(toLanguagePrefix("en")).toBe(LanguagePrefix.English)
      expect(toLanguagePrefix("es")).toBe(LanguagePrefix.Spanish)
      expect(toLanguagePrefix("zh")).toBe(LanguagePrefix.Chinese)
      expect(toLanguagePrefix("tl")).toBe(LanguagePrefix.Tagalog)
    })
  })

  describe("getRoutePrefix", () => {
    it("gets the prefix from the url when one exists with a leading slash", () => {
      expect(getRoutePrefix("/en/sign-in")).toBe("en")
      expect(getRoutePrefix("/es/sign-in")).toBe("es")
      expect(getRoutePrefix("/zh/sign-in")).toBe("zh")
      expect(getRoutePrefix("/tl/sign-in")).toBe("tl")
      expect(getRoutePrefix("/sign-in")).toBeUndefined()
    })

    it("gets the prefix from the url when one exists without a leading slash", () => {
      expect(getRoutePrefix("en/sign-in")).toBe("en")
      expect(getRoutePrefix("es/sign-in")).toBe("es")
      expect(getRoutePrefix("zh/sign-in")).toBe("zh")
      expect(getRoutePrefix("tl/sign-in")).toBe("tl")
      expect(getRoutePrefix("sign-in")).toBeUndefined()
    })

    it("gets the prefix from the url when on the homepage", () => {
      expect(getRoutePrefix("")).toBeUndefined()
      expect(getRoutePrefix("en")).toBe("en")
      expect(getRoutePrefix("es")).toBe("es")
      expect(getRoutePrefix("zh")).toBe("zh")
      expect(getRoutePrefix("tl")).toBe("tl")

      expect(getRoutePrefix("/")).toBeUndefined()
      expect(getRoutePrefix("/en")).toBe("en")
      expect(getRoutePrefix("/es")).toBe("es")
      expect(getRoutePrefix("/zh")).toBe("zh")
      expect(getRoutePrefix("/tl")).toBe("tl")
    })

    it("doesn't match on other prefixes in the path", () => {
      expect(getRoutePrefix("sign-in/")).toBeUndefined()
      expect(getRoutePrefix("sign-in/en")).toBeUndefined()
      expect(getRoutePrefix("sign-in/es")).toBeUndefined()
      expect(getRoutePrefix("sign-in/zh")).toBeUndefined()
      expect(getRoutePrefix("sign-in/tl")).toBeUndefined()
    })
  })

  describe("getPathWithoutLanguagePrefix", () => {
    it("gets the prefix-less path from the url when a prefix exists with a leading slash", () => {
      expect(getPathWithoutLanguagePrefix("/en/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("/es/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("/zh/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("/tl/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("/sign-in/")).toBe("/sign-in")
    })

    it("gets the prefix-less path from the url when a prefix exists without a leading slash", () => {
      expect(getPathWithoutLanguagePrefix("en/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("es/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("zh/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("tl/sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("sign-in")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("sign-in/")).toBe("/sign-in")
    })

    it("gets the prefix-less path from the url when on the homepage", () => {
      expect(getPathWithoutLanguagePrefix("")).toBe("/")
      expect(getPathWithoutLanguagePrefix("en")).toBe("/")
      expect(getPathWithoutLanguagePrefix("es")).toBe("/")
      expect(getPathWithoutLanguagePrefix("zh")).toBe("/")
      expect(getPathWithoutLanguagePrefix("tl")).toBe("/")

      expect(getPathWithoutLanguagePrefix("/")).toBe("/")
      expect(getPathWithoutLanguagePrefix("/en")).toBe("/")
      expect(getPathWithoutLanguagePrefix("/es")).toBe("/")
      expect(getPathWithoutLanguagePrefix("/zh")).toBe("/")
      expect(getPathWithoutLanguagePrefix("/tl")).toBe("/")
    })

    it("doesn't match on other prefixes in the path", () => {
      expect(getPathWithoutLanguagePrefix("sign-in/")).toBe("/sign-in")
      expect(getPathWithoutLanguagePrefix("sign-in/en")).toBe("/sign-in/en")
      expect(getPathWithoutLanguagePrefix("sign-in/es")).toBe("/sign-in/es")
      expect(getPathWithoutLanguagePrefix("sign-in/zh")).toBe("/sign-in/zh")
      expect(getPathWithoutLanguagePrefix("sign-in/tl")).toBe("/sign-in/tl")

      expect(getPathWithoutLanguagePrefix("/es/sign-in/en")).toBe("/sign-in/en")
      expect(getPathWithoutLanguagePrefix("/zh/sign-in/es")).toBe("/sign-in/es")
      expect(getPathWithoutLanguagePrefix("/tl/sign-in/zh")).toBe("/sign-in/zh")
      expect(getPathWithoutLanguagePrefix("/zh/sign-in/tl")).toBe("/sign-in/tl")
    })
  })

  describe("getCurrentLanguage", () => {
    it("gets the current language from the url when a prefix exists with a leading slash", () => {
      expect(getCurrentLanguage("/en/sign-in")).toBe("en")
      expect(getCurrentLanguage("/es/sign-in")).toBe("es")
      expect(getCurrentLanguage("/zh/sign-in")).toBe("zh")
      expect(getCurrentLanguage("/tl/sign-in")).toBe("tl")
      expect(getCurrentLanguage("/sign-in")).toBe("en")
      expect(getCurrentLanguage("/sign-in/")).toBe("en")
    })

    it("gets the current language from the url when a prefix exists without a leading slash", () => {
      expect(getCurrentLanguage("en/sign-in")).toBe("en")
      expect(getCurrentLanguage("es/sign-in")).toBe("es")
      expect(getCurrentLanguage("zh/sign-in")).toBe("zh")
      expect(getCurrentLanguage("tl/sign-in")).toBe("tl")
      expect(getCurrentLanguage("sign-in")).toBe("en")
      expect(getCurrentLanguage("sign-in/")).toBe("en")
    })

    it("gets the current language from the url when on the homepage", () => {
      expect(getCurrentLanguage("")).toBe("en")
      expect(getCurrentLanguage("en")).toBe("en")
      expect(getCurrentLanguage("es")).toBe("es")
      expect(getCurrentLanguage("zh")).toBe("zh")
      expect(getCurrentLanguage("tl")).toBe("tl")

      expect(getCurrentLanguage("/")).toBe("en")
      expect(getCurrentLanguage("/en")).toBe("en")
      expect(getCurrentLanguage("/es")).toBe("es")
      expect(getCurrentLanguage("/zh")).toBe("zh")
      expect(getCurrentLanguage("/tl")).toBe("tl")
    })

    it("doesn't match on other prefixes in the path", () => {
      expect(getCurrentLanguage("sign-in/")).toBe("en")
      expect(getCurrentLanguage("sign-in/en")).toBe("en")
      expect(getCurrentLanguage("sign-in/es")).toBe("en")
      expect(getCurrentLanguage("sign-in/zh")).toBe("en")
      expect(getCurrentLanguage("sign-in/tl")).toBe("en")
    })
  })

  describe("getReservedCommunityType", () => {
    it("returns translation when known reserved community type", () => {
      expect(getReservedCommunityType("Senior")).toBe("Senior Building")
    })

    it("returns translation when unknown reserved community type", () => {
      expect(getReservedCommunityType("New Type")).toBe("New Type")
    })
  })

  describe("getCustomListingType", () => {
    it("returns translation when known custom listing type", () => {
      expect(getCustomListingType("Educator 1: SFUSD employees only")).toBe(
        "SF public schools employee housing"
      )
    })

    it("returns undefined when unknown custom listing type", () => {
      expect(getCustomListingType("Unknown Type")).toBeUndefined()
    })
  })

  describe("emptyIfNotTranslated", () => {
    // errors are expected for these tests, suppress console
    beforeEach(() => {
      jest.spyOn(console, "error")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.error.mockImplementation(() => null)
    })
    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.error.mockRestore()
    })

    const salesforceVals = ["2 BR", "500 BR"]
    it("returns a translated string", () => {
      expect(
        defaultIfNotTranslated(`listings.unitTypes.${salesforceVals[0]}`, salesforceVals[0])
      ).toBe("2 Bedroom")
    })

    it("returns untranslated value when no translation found", () => {
      expect(
        defaultIfNotTranslated(`listings.unitTypes.${salesforceVals[1]}`, salesforceVals[1])
      ).toBe("500 BR")
    })

    it("returns interpolated value when interpolations param passed", () => {
      expect(defaultIfNotTranslated(`listings.unitsAreFor`, "", { type: "testing" })).toBe(
        "These units are for testing."
      )
    })
  })

  describe("localizedFormat", () => {
    const date = "2050-01-01T01:00:00.000+0000"

    it("formats date", () => {
      expect(localizedFormat(date, "LL")).toBe("January 1, 2050")
    })

    it("formats date and time", () => {
      expect(localizedFormat(date, "LLL")).toBe("January 1, 2050 1:00 AM")
    })
  })
})
