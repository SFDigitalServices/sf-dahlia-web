import React, { useContext, useState, useMemo } from "react"
import { Icon, ListSection, StandardTable, Button, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { renderMarkup } from "../../util/languageUtil"
import { getMinMaxOccupancy, isHabitatListing, isSale } from "../../util/listingUtil"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"
import "./ListingDetailsEligibility.scss"

export interface ListingDetailsEligibilityProps {
  listing: RailsListing
  imageSrc: string
}

const buildHmiHeadersForOneAmi = () => {
  return {
    householdSize: "t.householdSize",
    maxIncomeMonth: "t.maximumIncomeMonth",
    maxIncomeYear: "t.maximumIncomeYear",
  }
}

const buildHmiChartHeaders = (amiCharts) => {
  return amiCharts.length > 1
    ? buildHmiHeadersForOneAmi()
    : buildHmiHeadersForMultipleAmis(amiCharts)
}

const buildHmiHeadersForMultipleAmis = (amiCharts) => {
  const headers = {
    householdSize: "t.householdSize",
  }
  amiCharts.forEach((chart) => {
    headers[`ami${chart.percent}`] = `${chart.percent}% AMI`
  })
  return headers
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

const buildHmiCharts = (listingIsSale, units, amiCharts) => {
  const { min, max } = getMinMaxOccupancy(units, amiCharts, listingIsSale)
  if (listingIsSale) {
    max += 2
  }

  // can this be done in a way that doesn't recalculate?
  if (amiCharts.length > 1) {
    return buildHmiChartsForOneAmi(min, max, amiCharts, toDisplayAllData)
  } else {
    return buildHmiChartsForMultipleAmis(min, max, amiCharts, toDisplayAllData)
  }
}

const buildHmiChartsForOneAmi = (
  listingIsSale,
  minOccupancy,
  maxOccupancy,
  amiCharts,
  //  HMITableData,
  hmiTableCollapsed
) => {
  const maxHmi = listingIsSale ? minMaxOccupancies.max : minMaxOccupancies.max + 2
  const max = hmiTableCollapsed ? 2 : maxHmi
  for (let i = minMaxOccupancies.min; i <= max; i++) {
    const amiChart = amiCharts[0]?.values?.find((amiChart) => {
      return amiChart.numOfHousehold === i
    })

    let householdSize

    if (i === 1) {
      householdSize = {
        content: <span className="font-semibold">{t("listings.onePerson")}</span>,
      }
    } else {
      householdSize = {
        content: <span className="font-semibold">{`${i} ${t("listings.people")}`}</span>,
      }
    }

    HMITableData.push({
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

  return HMITableData
}

const buildHmiChartsForMultipleAmis = (
  listingIsSale,
  minMaxOccupancies,
  amiCharts,
  HMITableData,
  hmiTableCollapsed
) => {
  amiCharts.sort(sortAmisByPercent)
  const maxHmi = listingIsSale ? minMaxOccupancies.max : minMaxOccupancies.max + 2
  const max = hmiTableCollapsed ? 2 : maxHmi
  for (let i = minMaxOccupancies.min; i <= max; i++) {
    const HMITableRow = {}

    let householdSize

    if (i === 1) {
      householdSize = {
        content: <span className="font-semibold">{t("listings.onePerson")}</span>,
      }
    } else {
      householdSize = {
        content: <span className="font-semibold">{`${i} ${t("listings.people")}`}</span>,
      }
    }

    amiCharts.forEach((chart) => {
      const amiChart = chart.values?.find((amiChart) => {
        return amiChart.numOfHousehold === i
      })

      HMITableRow[`ami${chart.percent}`] = {
        content: t("t.perYearCost", { cost: `$${amiChart?.amount?.toLocaleString()}` }),
      }
    })

    HMITableData.push({
      householdSize,
      ...HMITableRow,
    })
  }
}

export interface ReducedUnit {
  name: string
  numberOfUnits: number
}

export const ListingDetailsHMITable = ({ listing }: ListingDetailsEligibilityProps) => {
  const { fetchedAmiCharts, amiCharts, fetchedUnits, units } = useContext(ListingDetailsContext)
  //const [hmiTableCollapsed, setHmiTableCollapsed] = useState(true)

  const [numberOfRowsToDisplay, setNumberOfRowsToDisplay] = useState(2)

  const hmiChartData = useMemo(() => {
    buildHmiChartData()
  }, [])

  const hmiChartHeaders = useMemo(() => {
    buildHmiChartHeaders(amiCharts)
  }, [])

  const listingIsSale = isSale(listing)
  let HMITableHeaders = {}
  let HMITableData = []

  if (!fetchedAmiCharts || !fetchedUnits) {
    return (
      <li className="flex w-full justify-center">
        <Icon symbol="spinner" size="large" />
      </li>
    )
  }

  if (fetchedAmiCharts && fetchedUnit) {
    HMITableData = buildHmiCharts(listingIsSale, units, amiCharts)
    HMITableHeaders = buildHmiHeader(listingIsSale, amiCharts)
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
      <StandardTable headers={HMITableHeaders} data={HMITableData} />
      <Button
        inlineIcon="right"
        className="underline font-medium bg-primary-lighter"
        iconSize="small"
        icon={hmiTableCollapsed ? faAngleDown : faAngleUp}
        onClick={() => {
          setHmiTableCollapsed(!hmiTableCollapsed)
        }}
      >
        {hmiTableCollapsed ? t("label.showMore") : t("label.showLess")}
      </Button>
    </ListSection>
  )
}
