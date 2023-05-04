import React, { useContext, useState, useMemo } from "react"
import { Icon, ListSection, StandardTable, Button, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { renderMarkup } from "../../util/languageUtil"
import { getMinMaxOccupancy, isSale } from "../../util/listingUtil"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"
import "./ListingDetailsEligibility.scss"

export interface ListingDetailsEligibilityProps {
  listing: RailsListing
}

const buildHmiHeadersWithOneAmi = () => {
  return {
    householdSize: "t.householdSize",
    maxIncomeMonth: "t.maximumIncomeMonth",
    maxIncomeYear: "t.maximumIncomeYear",
  }
}

const buildHmiHeadersWithMultipleAmis = (amiCharts) => {
  const headers = {
    householdSize: "t.householdSize",
  }
  amiCharts.forEach((chart) => {
    headers[`ami${chart.percent}`] = `t.percentAMI*percent:${chart.percent}`
  })
  return headers
}

const buildHmiChartHeaders = (amiCharts) => {
  return amiCharts.length > 1
    ? buildHmiHeadersWithMultipleAmis(amiCharts)
    : buildHmiHeadersWithOneAmi()
}

const sortAmisByPercent = (a, b) => {
  if (a.percent < b.percent) {
    return -1
  }
  if (a.percent > b.percent) {
    return 1
  }
  return 0
}

const buildHmiTableWithOneAmiChart = (minOccupancy, maxOccupancy, amiCharts) => {
  const tableData = []
  for (let i = minOccupancy; i <= maxOccupancy; i++) {
    const amiChart = amiCharts[0]?.values?.find((amiChart) => {
      return amiChart.numOfHousehold === i
    })

    const householdSize =
      i === 1
        ? {
            content: <span className="font-semibold">{t("listings.onePerson")}</span>,
          }
        : {
            content: <span className="font-semibold">{`${i} ${t("listings.people")}`}</span>,
          }

    tableData.push({
      householdSize,
      maxIncomeMonth: {
        content: t("t.perMonthCost", {
          cost: `$${Math.floor(amiChart?.amount / 12).toLocaleString()}`,
        }),
      },
      maxIncomeYear: {
        content: t("t.perYearCost", { cost: `$${amiChart?.amount?.toLocaleString()}` }),
      },
    })
  }

  return tableData
}

const buildHmiTableWithMultipleAmis = (minOccupancy, maxOccupancy, amiCharts) => {
  const tableData = []

  amiCharts.sort(sortAmisByPercent)

  for (let i = minOccupancy; i <= maxOccupancy; i++) {
    const tableRow = {}

    const householdSize =
      i === 1
        ? {
            content: <span className="font-semibold">{t("listings.onePerson")}</span>,
          }
        : {
            content: <span className="font-semibold">{`${i} ${t("listings.people")}`}</span>,
          }

    amiCharts.forEach((chart) => {
      const amiChart = chart.values?.find((amiChart) => {
        return amiChart.numOfHousehold === i
      })

      tableRow[`ami${chart.percent}`] = {
        content: t("t.perYearCost", { cost: `$${amiChart?.amount?.toLocaleString()}` }),
      }
    })

    tableData.push({
      householdSize,
      ...tableRow,
    })
  }

  return tableData
}

const buildHmiCharts = (listingIsSale, units, amiCharts) => {
  let { min, max } = getMinMaxOccupancy(units, amiCharts, listingIsSale)

  if (!listingIsSale) {
    max += 2
  }

  return amiCharts.length > 1
    ? buildHmiTableWithMultipleAmis(min, max, amiCharts)
    : buildHmiTableWithOneAmiChart(min, max, amiCharts)
}

export interface ReducedUnit {
  name: string
  numberOfUnits: number
}

export const ListingDetailsHMITable = ({ listing }: ListingDetailsEligibilityProps) => {
  const listingIsSale = isSale(listing)
  const { fetchedAmiCharts, amiCharts, fetchedUnits, units } = useContext(ListingDetailsContext)
  const [tableCollapsed, setTableCollapsed] = useState(true)

  const HMITableData = useMemo(() => {
    if (!fetchedAmiCharts || !fetchedUnits) {
      return []
    }
    return buildHmiCharts(listingIsSale, units, amiCharts)
  }, [listingIsSale, units, amiCharts, fetchedAmiCharts, fetchedUnits])

  const HMITableHeaders = useMemo(() => {
    if (!fetchedAmiCharts) {
      return {}
    }
    return buildHmiChartHeaders(amiCharts)
  }, [fetchedAmiCharts, amiCharts])

  if (!fetchedAmiCharts || !fetchedUnits) {
    return (
      <li className="flex w-full justify-center">
        <Icon symbol="spinner" size="large" />
      </li>
    )
  }

  const expandTableHandler = () => {
    setTableCollapsed(!tableCollapsed)
  }

  return (
    <ListSection
      title={t("listings.householdMaximumIncome")}
      subtitle={
        <div>
          <div className="mb-4">{renderMarkup(t("listings.forIncomeCalculations"))}</div>
          <div className="mb-4 primary-lighter-markup-link-desktop">
            {renderMarkup(
              t("listings.incomeExceptions.intro", {
                url: "https://sfmohcd.org/special-calculations-household-income",
              })
            )}
          </div>
          <ul className="list-disc ml-5">
            <li>{t("listings.incomeExceptions.students")}</li>
            <li>{t("listings.incomeExceptions.nontaxable")}</li>
          </ul>
        </div>
      }
    >
      <StandardTable
        headers={HMITableHeaders}
        data={tableCollapsed ? HMITableData.slice(0, 2) : HMITableData}
      />
      <Button
        inlineIcon="right"
        className="underline font-medium md:bg-primary-lighter mt-3"
        iconSize="small"
        icon={tableCollapsed ? faAngleDown : faAngleUp}
        onClick={expandTableHandler}
      >
        {tableCollapsed ? t("label.showMore") : t("label.showLess")}
      </Button>
    </ListSection>
  )
}
