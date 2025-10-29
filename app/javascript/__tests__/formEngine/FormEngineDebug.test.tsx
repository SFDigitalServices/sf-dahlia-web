import React from "react"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import FormEngineDebug from "../../formEngine/FormEngineDebug"
import { type StepInfoSchema } from "../../formEngine/formSchemas"
import { type DataSources } from "../../formEngine/formEngineContext"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"

describe("FormEngineDebug", () => {
  const setCurrentStepIndex = jest.fn()
  const stepInfoMap: StepInfoSchema[] = [
    { slug: "step-1", sectionName: "test-section" },
    { slug: "step-2" },
    { slug: "step-3" },
  ]
  const dataSources: DataSources = {
    form: {
      testField: "test value",
    },
    listing: openRentalListing,
    preferences: {
      testPref: "test pref",
    },
  }
  const props = {
    currentStepIndex: 0,
    setCurrentStepIndex,
    stepInfoMap,
    dataSources,
  }

  const user = userEvent.setup()

  it("toggles step list with button", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show steps/i }))
    expect(screen.queryByText("step-1")).not.toBeNull()
    expect(screen.queryByText("step-2")).not.toBeNull()
    expect(screen.queryByText("step-3")).not.toBeNull()

    await user.click(screen.getByRole("button", { name: /hide steps/i }))
    expect(screen.queryByText("step-1")).toBeNull()
    expect(screen.queryByText("step-2")).toBeNull()
    expect(screen.queryByText("step-3")).toBeNull()
  })

  it("calls the function to set the current step when clicking on another slug", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show steps/i }))
    await user.click(screen.getByRole("button", { name: /step-2/i }))
    expect(setCurrentStepIndex).toHaveBeenCalled()
  })

  it("toggles step info with button", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show step info/i }))
    expect(screen.queryByText(/"sectionName": "test-section"/)).not.toBeNull()

    await user.click(screen.getByRole("button", { name: /hide step info/i }))
    expect(screen.queryByText(/"sectionName": "test-section"/)).toBeNull()
  })

  it("toggles form data with button", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show form data/i }))
    expect(screen.queryByText(/"testField": "test value"/)).not.toBeNull()

    await user.click(screen.getByRole("button", { name: /hide form data/i }))
    expect(screen.queryByText(/"testField": "test value"/)).toBeNull()
  })

  it("toggles listing data with button", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show listing data/i }))
    expect(screen.queryByText(/"Lottery_Status":/)).not.toBeNull()

    await user.click(screen.getByRole("button", { name: /hide listing data/i }))
    expect(screen.queryByText(/"Lottery_Status":/)).toBeNull()
  })

  it("toggles preference data with button", async () => {
    render(<FormEngineDebug {...props} />)

    await user.click(screen.getByRole("button", { name: /show prefs data/i }))
    expect(screen.queryByText(/"testPref": "test pref"/)).not.toBeNull()

    await user.click(screen.getByRole("button", { name: /hide prefs data/i }))
    expect(screen.queryByText(/"testPref": "test pref"/)).toBeNull()
  })
})
