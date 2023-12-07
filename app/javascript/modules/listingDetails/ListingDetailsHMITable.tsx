import React, { useContext, useState, useMemo, useEffect } from "react"
import { Icon, StandardTable, Button, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { getMinMaxOccupancy, isSale } from "../../util/listingUtil"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"
import { RailsAmiChart, RailsAmiChartValue } from "../../api/types/rails/listings/RailsAmiChart"
import "./ListingDetailsEligibility.scss"

export interface ListingDetailsEligibilityProps {
  listing: RailsListing
}

const toShowButton = (maxOccupancy: number, minOccupancy: number, hmiCutoff: number): boolean => {
  if (!maxOccupancy) {
    return false
  }

  const calculatedMaxOccupancy = maxOccupancy + 2 - minOccupancy

  if (calculatedMaxOccupancy > hmiCutoff) {
    return true
  }
  return false
}

const buildHmiHeadersWithOneAmi = () => {
  return {
    householdSize: "t.householdSize",
    maxIncomeMonth: "t.maximumIncomeMonth",
    maxIncomeYear: "t.maximumIncomeYear",
  }
}

const hasMultipleUniqueChartsByPercent = (amiCharts: RailsAmiChart[]) => {
  return (
    amiCharts
      .map((chart) => chart.percent)
      .filter((currentPercent, idx, allPercents) => allPercents.indexOf(currentPercent) === idx)
      .length > 1
  )
}

const buildHmiHeadersWithMultipleAmis = (amiCharts: RailsAmiChart[]) => {
  const headers = {
    householdSize: "t.householdSize",
  }
  amiCharts?.forEach((chart: RailsAmiChart) => {
    headers[`ami${chart.percent}`] = `t.percentAMI*percent:${chart.percent}`
  })
  return headers
}

const buildHmiChartHeaders = (amiCharts: RailsAmiChart[]) => {
  return hasMultipleUniqueChartsByPercent(amiCharts)
    ? buildHmiHeadersWithMultipleAmis(amiCharts)
    : buildHmiHeadersWithOneAmi()
}

const sortAmisByPercent = (a: RailsAmiChart, b: RailsAmiChart) => {
  const numA = Number(a.percent)
  const numB = Number(b.percent)

  if (numA < numB) {
    return -1
  }
  if (numA > numB) {
    return 1
  }
  return 0
}

const buildHmiTableWithOneAmiChart = (
  minOccupancy: number,
  maxOccupancy: number,
  amiCharts: RailsAmiChart[]
) => {
  const tableData = []
  const mostRecentAmiChart = amiCharts[amiCharts.length - 1]
  for (let i = minOccupancy; i <= maxOccupancy; i++) {
    const amiChart = mostRecentAmiChart?.values?.find((amiChart: RailsAmiChartValue) => {
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
    if (amiChart) {
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
  }

  return tableData
}

const buildHmiTableWithMultipleAmis = (
  minOccupancy: number,
  maxOccupancy: number,
  amiCharts: RailsAmiChart[]
) => {
  const tableData = []
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

    amiCharts?.forEach((chart) => {
      const amiChart = chart.values?.find((amiChart) => {
        return amiChart.numOfHousehold === i
      })
      if (amiChart) {
        // if there are charts with the same percent, the chart with the largest index is used
        tableRow[`ami${chart.percent}`] = {
          content: t("t.perYearCost", { cost: `$${amiChart?.amount?.toLocaleString()}` }),
        }
      }
    })

    tableData.push({
      householdSize,
      ...tableRow,
    })
  }

  return tableData
}

const buildHmiCharts = (
  listingIsSale: boolean,
  amiCharts: RailsAmiChart[],
  minOccupancy: number,
  maxOccupancy: number
) => {
  if (!listingIsSale) {
    maxOccupancy += 2
  }

  return hasMultipleUniqueChartsByPercent(amiCharts)
    ? buildHmiTableWithMultipleAmis(minOccupancy, maxOccupancy, amiCharts)
    : buildHmiTableWithOneAmiChart(minOccupancy, maxOccupancy, amiCharts)
}

export interface ReducedUnit {
  name: string
  numberOfUnits: number
}

export const ListingDetailsHMITable = ({ listing }: ListingDetailsEligibilityProps) => {
  const listingIsSale = isSale(listing)
  const {
    fetchingAmiCharts,
    fetchedAmiCharts,
    amiCharts,
    fetchingUnits,
    fetchedUnits,
    units,
    fetchingAmiChartsError,
    fetchingUnitsError,
  } = useContext(ListingDetailsContext)

  useEffect(() => {
    if (fetchingAmiChartsError) {
      // TODO: Log error properly
      throw fetchingAmiChartsError
    }
    if (fetchingUnitsError) {
      // TODO: Log error properly
      throw fetchingUnitsError
    }
  }, [fetchingAmiChartsError, fetchingUnitsError])

  if (amiCharts?.length > 0) {
    amiCharts.sort(sortAmisByPercent)
  }

  const [tableCollapsed, setTableCollapsed] = useState(true)

  const { minOccupancy, maxOccupancy, explicitMaxOccupancy } = useMemo(() => {
    if (!fetchedAmiCharts || !fetchedUnits) {
      return { minOccupancy: undefined, maxOccupnacy: undefined }
    }

    return getMinMaxOccupancy(units, amiCharts)
  }, [units, amiCharts, fetchedAmiCharts, fetchedUnits])

  const HMITableData = useMemo(() => {
    if (!fetchedAmiCharts || !fetchedUnits) {
      return []
    }

    return buildHmiCharts(listingIsSale, amiCharts, minOccupancy, maxOccupancy)
  }, [listingIsSale, amiCharts, fetchedAmiCharts, fetchedUnits, minOccupancy, maxOccupancy])

  const hmiCutoff = explicitMaxOccupancy ? Math.max(Math.floor(maxOccupancy / 2) * 2, 1) : 2

  const HMITableHeaders = useMemo(() => {
    if (!fetchedAmiCharts) {
      return {}
    }
    return buildHmiChartHeaders(amiCharts)
  }, [fetchedAmiCharts, amiCharts])

  if (fetchingUnits || fetchingAmiCharts) {
    return (
      <div className="flex w-full justify-center">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  const expandTableHandler = (): void => {
    setTableCollapsed(!tableCollapsed)
  }

  return (
    <>
      <StandardTable
        headers={HMITableHeaders}
        data={tableCollapsed ? HMITableData.slice(0, hmiCutoff) : HMITableData}
      />
      {toShowButton(maxOccupancy, minOccupancy, hmiCutoff) && (
        <Button
          inlineIcon="right"
          className="font-medium md:bg-primary-lighter mt-3 text-primary-dark"
          iconSize="small"
          icon={tableCollapsed ? faAngleDown : faAngleUp}
          onClick={expandTableHandler}
          ariaLabel={t("listings.householdMaximumIncome.showMore.aria")}
          ariaExpanded={!tableCollapsed}
        >
          {tableCollapsed ? t("label.showMore") : t("label.showLess")}
        </Button>
      )}
    </>
  )
}
