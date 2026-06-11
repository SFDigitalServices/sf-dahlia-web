import React from "react"
import { render, screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import ContactCard from "../../../../pages/account/components/ContactCard"
import { mockProfileStub } from "../../../__util__/accountUtils"
import { getMyAccountContactPath } from "../../../../util/routeUtil"

describe("ContactCard", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
  })

  it("displays Hi and the user's name", () => {
    render(<ContactCard user={mockProfileStub} />)

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: t("accountLayout.accountCard.title", {
          name: `${mockProfileStub.firstName} ${mockProfileStub.lastName}`,
        }),
      })
    ).toBeInTheDocument()
  })

  it("has a button linking to the account contact page", () => {
    render(<ContactCard user={mockProfileStub} />)

    expect(
      screen.getByRole("link", { name: t("accountLayout.accountCard.changeInfo") })
    ).toHaveAttribute("href", getMyAccountContactPath())
  })

  it("has email and phone icons", () => {
    const { container } = render(<ContactCard user={mockProfileStub} />)

    expect(container.querySelector('[data-icon="envelope"]')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="phone"]')).toBeInTheDocument()
  })

  it("displays content for when there is no contact info", () => {
    const userWithoutContactInfo = { ...mockProfileStub, email: "", phone: "" }
    render(<ContactCard user={userWithoutContactInfo} />)

    expect(screen.getByText(t("accountLayout.accountCard.noInfo"))).toBeInTheDocument()
    expect(screen.queryByText(t("accountLayout.accountCard.subtitle"))).not.toBeInTheDocument()
  })
})
