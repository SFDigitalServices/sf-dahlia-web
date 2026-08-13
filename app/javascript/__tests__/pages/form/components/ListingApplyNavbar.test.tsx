import React from "react"
import { t } from "@bloom-housing/ui-components"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ListingApplyNavBar from "../../../../pages/form/components/ListingApplyNavbar"
import { type SectionInfo } from "../../../../formEngine/formEngine"

const sectionMap: SectionInfo[] = [
  { name: "shortFormNav.you", stepSlugs: ["you-step"] },
  { name: "shortFormNav.household", stepSlugs: ["household-step-1", "household-step-2"] },
  { name: "shortFormNav.income", stepSlugs: ["income-step"] },
]

describe("ListingApplyNavBar", () => {
  it("renders the current section as non-clickable", () => {
    render(
      <ListingApplyNavBar
        sectionMap={sectionMap}
        completedSections={{}}
        currentSectionName="shortFormNav.you"
        jumpToStep={jest.fn()}
      />
    )

    expect(screen.getByText(t("shortFormNav.you"))).toHaveAttribute("aria-current", "true")
    expect(screen.queryByRole("button", { name: t("shortFormNav.you") })).not.toBeInTheDocument()
  })

  it("jumps to the first step when an accessible section is clicked", async () => {
    const user = userEvent.setup()
    const jumpToStep = jest.fn()
    render(
      <ListingApplyNavBar
        sectionMap={sectionMap}
        completedSections={{ "shortFormNav.you": true }}
        currentSectionName="shortFormNav.you"
        jumpToStep={jumpToStep}
      />
    )

    await user.click(screen.getByRole("button", { name: t("shortFormNav.household") }))
    expect(jumpToStep).toHaveBeenCalledWith("household-step-1")
  })

  it("renders subsequent sections as inaccessible when current section is incomplete", () => {
    render(
      <ListingApplyNavBar
        sectionMap={sectionMap}
        completedSections={{
          "shortFormNav.you": true,
          "shortFormNav.household": false,
          "shortFormNav.income": true,
        }}
        currentSectionName="shortFormNav.household"
        jumpToStep={jest.fn()}
      />
    )

    expect(screen.queryByRole("button", { name: t("shortFormNav.income") })).not.toBeInTheDocument()
    expect(screen.getByText(t("shortFormNav.income"))).toHaveAttribute("aria-disabled", "true")
  })

  it("does not jump when an accessible section has no first step slug", async () => {
    const user = userEvent.setup()
    const jumpToStep = jest.fn()
    render(
      <ListingApplyNavBar
        sectionMap={[
          { name: "shortFormNav.you", stepSlugs: ["you-step"] },
          { name: "shortFormNav.preferences", stepSlugs: [] },
        ]}
        completedSections={{ "shortFormNav.you": true }}
        currentSectionName="shortFormNav.you"
        jumpToStep={jumpToStep}
      />
    )

    await user.click(screen.getByRole("button", { name: t("shortFormNav.preferences") }))
    expect(jumpToStep).not.toHaveBeenCalled()
  })
})
