import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyIncomeVouchersHeader from "../../../../pages/form/components/ListingApplyIncomeVouchersHeader"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyIncomeVouchersHeader", () => {
  it("renders the household title when liveAlone is false", () => {
    renderWithFormContextWrapper(<ListingApplyIncomeVouchersHeader />, {
      formData: { liveAlone: "false" },
    })

    expect(screen.getByText(t("d1IncomeVouchers.titleHousehold"))).not.toBeNull()
  })

  it("renders the individual title when liveAlone is true", () => {
    renderWithFormContextWrapper(<ListingApplyIncomeVouchersHeader />, {
      formData: { liveAlone: "true" },
    })

    expect(screen.getByText(t("d1IncomeVouchers.titleYou"))).not.toBeNull()
  })

  it("renders the individual title when liveAlone is not set", () => {
    renderWithFormContextWrapper(<ListingApplyIncomeVouchersHeader />)

    expect(screen.getByText(t("d1IncomeVouchers.titleYou"))).not.toBeNull()
  })
})
