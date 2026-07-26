import { dateOfBirth, text, yesNoToBooleanString } from "../../../util/applicationTransforms/codecs"
import {
  applyFromSf,
  applyToSf,
  prefixForm,
  type FieldMap,
} from "../../../util/applicationTransforms/fieldMap"

const map: FieldMap = [
  { form: "firstName", sf: "firstName", codec: text },
  { form: "workInSf", sf: "workInSf", codec: yesNoToBooleanString },
  { form: ["birthYear", "birthMonth", "birthDate"], sf: "dob", codec: dateOfBirth },
  { form: "relationship", sf: "relationship" },
  { form: "lotteryNumber", sf: "lotteryNumber", readOnly: true },
]

describe("field map engine", () => {
  describe("applyToSf", () => {
    it("renames fields and applies codecs", () => {
      expect(
        applyToSf(map, {
          firstName: "Alice",
          workInSf: "Yes",
          birthYear: "1985",
          birthMonth: "6",
          birthDate: "5",
          relationship: "Cousin",
        })
      ).toEqual({
        firstName: "Alice",
        workInSf: "true",
        dob: "1985-06-05",
        relationship: "Cousin",
      })
    })

    it("omits fields with no value rather than sending nulls", () => {
      expect(applyToSf(map, { firstName: "Alice" })).toEqual({ firstName: "Alice" })
    })

    it("skips read-only fields Salesforce calculates", () => {
      expect(applyToSf(map, { lotteryNumber: 42 })).toEqual({})
    })
  })

  describe("applyFromSf", () => {
    it("is the inverse of applyToSf", () => {
      const formData = {
        firstName: "Alice",
        workInSf: "Yes",
        birthYear: "1985",
        birthMonth: "06",
        birthDate: "05",
        relationship: "Cousin",
        lotteryNumber: "",
      }
      expect(applyFromSf(map, applyToSf(map, formData))).toEqual(formData)
    })

    it("spreads a multi-field codec back across its form fields", () => {
      const result = applyFromSf(map, { dob: "1985-06-05" })
      expect(result.birthYear).toBe("1985")
      expect(result.birthMonth).toBe("06")
      expect(result.birthDate).toBe("05")
    })

    it("reads read-only fields", () => {
      expect(applyFromSf(map, { lotteryNumber: 42 }).lotteryNumber).toBe(42)
    })

    it("fills empty form fields when the Salesforce record is empty", () => {
      expect(applyFromSf(map, {})).toEqual({
        firstName: "",
        workInSf: null,
        birthYear: "",
        birthMonth: "",
        birthDate: "",
        relationship: "",
        lotteryNumber: "",
      })
    })
  })

  describe("prefixForm", () => {
    it("namespaces the form side, leaving the Salesforce side alone", () => {
      const prefixed = prefixForm(map, "primaryApplicant")
      expect(prefixed[0]).toMatchObject({ form: "primaryApplicantFirstName", sf: "firstName" })
    })

    it("namespaces every field of a multi-field entry", () => {
      const prefixed = prefixForm(map, "primaryApplicant")
      expect(prefixed[2].form).toEqual([
        "primaryApplicantBirthYear",
        "primaryApplicantBirthMonth",
        "primaryApplicantBirthDate",
      ])
    })

    it("reads prefixed form data", () => {
      const prefixed = prefixForm(map, "primaryApplicant")
      expect(applyToSf(prefixed, { primaryApplicantFirstName: "Alice" })).toEqual({
        firstName: "Alice",
      })
    })
  })
})
