import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import FormEngine from "../../formEngine/formEngine"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"
import { defineCryptoApi } from "../__util__/renderUtils"
import type { FormSchema } from "../../formEngine/formSchemas"
import { useFormEngineContext } from "../../formEngine/formEngineContext"

jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    unleashFlag: false,
  }),
}))

Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
})
Element.prototype.scrollTo = jest.fn()
const mockCalculateNextStep = jest.fn().mockReturnValue(1)
const mockCalculatePrevStep = jest.fn().mockReturnValue(0)
const mockUpdateFormPath = jest.fn()

jest.mock("../../util/formEngineUtil", () => ({
  calculateNextStep: (...args: unknown[]) => mockCalculateNextStep(...args),
  calculatePrevStep: (...args: unknown[]) => mockCalculatePrevStep(...args),
  updateFormPath: (...args: unknown[]) => mockUpdateFormPath(...args),
}))

jest.mock("../../formEngine/recursiveRenderer", () => {
  return {
    __esModule: true,
    default: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const formEngineContext = useFormEngineContext()
      const {
        handleNextStep,
        handlePrevStep,
        jumpToStep,
        saveFormData,
        formData,
        currentStepIndex,
      } = formEngineContext
      return (
        <div>
          {/* expose context data so they can be easily tested with RTL */}
          <span data-testid="step-index">{currentStepIndex}</span>
          <span data-testid="form-data">{JSON.stringify(formData)}</span>
          {/* test all possible navigation buttons */}
          <button onClick={() => handleNextStep()}>next</button>
          <button onClick={() => handleNextStep({ custom: "data" })}>next-with-data</button>
          <button onClick={() => handlePrevStep()}>back</button>
          <button onClick={() => jumpToStep("step-b")}>jump</button>
          <button onClick={() => saveFormData({ testField: "saved" })}>save</button>
        </div>
      )
    },
  }
})

defineCryptoApi()

const staticData = {
  listing: openRentalListing,
  form: {},
  preferences: [],
  preferenceNames: {},
}

const mockSchema = (schemaOverrides?: Partial<FormSchema>): FormSchema => ({
  formType: "listingApplication",
  formSubType: "defaultRental",
  componentType: "multiStepLayout",
  componentName: "ListingApplyFormWrapper",
  children: [
    {
      stepInfo: { slug: "step-a" },
      componentType: "step",
      componentName: "ListingApplyIntro",
    },
    {
      stepInfo: { slug: "step-b" },
      componentType: "step",
      componentName: "ListingApplyOverview",
    },
  ],
  ...schemaOverrides,
})

describe("FormEngine", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCalculateNextStep.mockReturnValue(1)
    mockCalculatePrevStep.mockReturnValue(0)
  })

  it("renders an error when schema structure is invalid", () => {
    const invalidSchema = { bad: "schema" } as unknown as FormSchema
    jest.spyOn(console, "error").mockImplementation()

    render(
      <FormEngine sessionId="test-session-id" schema={invalidSchema} staticData={staticData} />
    )
    expect(console.error).toHaveBeenCalled()
    expect(screen.getByText("Schema structure is invalid")).not.toBeNull()
  })

  it("renders an error when schema contains invalid component names", () => {
    const schemaWithBadComponent = mockSchema({
      children: [
        {
          stepInfo: { slug: "intro" },
          componentType: "step",
          componentName: "NonExistentComponent",
        },
      ],
    })
    jest.spyOn(console, "error").mockImplementation()

    render(
      <FormEngine
        sessionId="test-session-id"
        schema={schemaWithBadComponent}
        staticData={staticData}
      />
    )
    expect(console.error).toHaveBeenCalled()
    expect(screen.getByText("Schema contains invalid component names")).not.toBeNull()
  })

  it("renders with a valid multiStepLayout schema", () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)
    expect(screen.getByTestId("step-index").textContent).toBe("0")
  })

  it("navigates to the next step via handleNextStep", async () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("next"))
    expect(mockCalculateNextStep).toHaveBeenCalled()
    expect(mockUpdateFormPath).toHaveBeenCalledWith(1, expect.any(Array))
    expect(screen.getByTestId("step-index").textContent).toBe("1")
  })

  it("passes currentFormData to calculateNextStep when provided", async () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("next-with-data"))
    expect(mockCalculateNextStep).toHaveBeenCalledWith(0, expect.any(Array), expect.any(Object), {
      custom: "data",
    })
  })

  it("does not navigate past the last step", async () => {
    mockCalculateNextStep.mockReturnValue(999)

    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("next"))
    expect(screen.getByTestId("step-index").textContent).toBe("0")
    expect(mockUpdateFormPath).not.toHaveBeenCalled()

    jest.resetAllMocks()
  })

  it("navigates to the previous step via handlePrevStep", async () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    // Go to step 1 first
    await user.click(screen.getByText("next"))
    expect(screen.getByTestId("step-index").textContent).toBe("1")

    // Go back
    await user.click(screen.getByText("back"))
    expect(mockCalculatePrevStep).toHaveBeenCalled()
    expect(screen.getByTestId("step-index").textContent).toBe("0")
  })

  it("does not navigate before the first step", async () => {
    mockCalculatePrevStep.mockReturnValue(-1)

    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("back"))
    expect(screen.getByTestId("step-index").textContent).toBe("0")

    jest.resetAllMocks()
  })

  it("navigates to a specific step via jumpToStep", async () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("jump"))
    // step-b is at index 1
    expect(screen.getByTestId("step-index").textContent).toBe("1")
    expect(mockUpdateFormPath).toHaveBeenCalledWith(1, expect.any(Array))
  })

  it("merges new data into formData via saveFormData", async () => {
    render(<FormEngine sessionId="test-session-id" schema={mockSchema()} staticData={staticData} />)

    await user.click(screen.getByText("save"))
    expect(JSON.parse(screen.getByTestId("form-data").textContent)).toMatchObject({
      testField: "saved",
    })
  })
})
