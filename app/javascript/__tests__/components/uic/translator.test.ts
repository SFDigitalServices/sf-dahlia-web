import {
  t,
  locale,
  createTranslationInstance,
  setActiveTranslationInstance,
} from "../../../components/uic/translator"
import { getTranslationWithArguments } from "../../../components/uic/getTranslationWithArguments"

// Deterministic bundle exercising every façade behavior (design §3.1–3.3, §3.5),
// independent of the real translation copy.
const EN = {
  plain: "Hello world",
  greeting: "Hello, %{name}!",
  multiVar: "%{count} of %{total}",
  // polyglot smart_count: inline plural delimiter + %{smart_count} interpolation
  units: "%{smart_count} unit available |||| %{smart_count} units available",
  // smart_count used purely as an interpolation var (no plural delimiter)
  range: "Range starts at %{smart_count}",
  htmlPlural: "<span>%{smart_count}</span> person |||| <span>%{smart_count}</span> people",
}

describe("translator façade (i18next-backed)", () => {
  beforeAll(() => {
    setActiveTranslationInstance(createTranslationInstance("en", { en: EN }))
  })

  it("returns a plain phrase unchanged", () => {
    expect(t("plain")).toBe("Hello world")
  })

  it("interpolates %{var} tokens", () => {
    expect(t("greeting", { name: "Ada" })).toBe("Hello, Ada!")
    expect(t("multiVar", { count: 2, total: 5 })).toBe("2 of 5")
  })

  it("does not HTML-escape interpolated values (escapeValue: false)", () => {
    expect(t("greeting", { name: "<b>x</b>" })).toBe("Hello, <b>x</b>!")
  })

  describe("pluralization (polyglot ||||, English rule)", () => {
    it("selects the singular form for a bare-number count of 1", () => {
      expect(t("units", 1)).toBe("1 unit available")
    })

    it("selects the plural form for a bare-number count != 1", () => {
      expect(t("units", 0)).toBe("0 units available")
      expect(t("units", 5)).toBe("5 units available")
    })

    it("honors smart_count passed as an object property", () => {
      expect(t("units", { smart_count: 1 })).toBe("1 unit available")
      expect(t("units", { smart_count: 3 })).toBe("3 units available")
    })

    it("interpolates smart_count without pluralizing when there is no |||| delimiter", () => {
      expect(t("range", 7)).toBe("Range starts at 7")
    })

    it("keeps embedded HTML in the chosen plural form", () => {
      expect(t("htmlPlural", 1)).toBe("<span>1</span> person")
      expect(t("htmlPlural", 4)).toBe("<span>4</span> people")
    })
  })

  it("returns the key itself when a phrase is missing (t(key) === key)", () => {
    expect(t("does.not.exist")).toBe("does.not.exist")
  })

  it("getTranslationWithArguments shims the key*arg:val syntax", () => {
    expect(getTranslationWithArguments("greeting*name:Grace")).toBe("Hello, Grace!")
    expect(getTranslationWithArguments("plain")).toBe("Hello world")
  })

  it("locale() reflects the active instance language", () => {
    expect(locale()).toBe("en")
  })

  describe("language fallback", () => {
    beforeAll(() => {
      setActiveTranslationInstance(
        createTranslationInstance("es", {
          en: EN,
          es: { plain: "Hola mundo" }, // es overrides only `plain`
        })
      )
    })
    afterAll(() => {
      setActiveTranslationInstance(createTranslationInstance("en", { en: EN }))
    })

    it("uses the target language when present", () => {
      expect(t("plain")).toBe("Hola mundo")
    })

    it("falls back to English for keys missing in the target", () => {
      expect(t("greeting", { name: "Ada" })).toBe("Hello, Ada!")
    })

    it("locale() reports the active target language", () => {
      expect(locale()).toBe("es")
    })
  })
})
