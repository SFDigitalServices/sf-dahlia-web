import React, { useContext, useState } from "react"
import { ListSection, StandardTable, Button, t } from "@bloom-housing/ui-components"
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

export interface ReducedUnit {
  name: string
  numberOfUnits: number
}

export const ListingDetailsHMITable = ({ listing }: ListingDetailsEligibilityProps) => {
  const listingIsSale = isSale(listing)
  const [hmiTableCollapsed, setHmiTableCollapsed] = useState(true)
  const { fetchedAmiCharts, amiCharts, fetchedUnits, units } = useContext(ListingDetailsContext)
  let minMaxOccupancies = {}
  if (fetchedAmiCharts && fetchedUnits) {
    minMaxOccupancies = getMinMaxOccupancy(units, amiCharts, listingIsSale)
  }

  let HMITableHeaders = {}
  const HMITableData = []

  const sortAmisByPercent = (a, b) => {
    if (a.percent < b.percent) {
      return -1
    }
    if (a.percent > b.percent) {
      return 1
    }
    return 0
  }

  const buildHmiChartsForMultipleAmis = () => {
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

  const buildHmiChartsForOneAmi = () => {
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
  }

  const buildHmiHeadersForOneAmi = () => {
    return {
      householdSize: "t.householdSize",
      maxIncomeMonth: "t.maximumIncomeMonth",
      maxIncomeYear: "t.maximumIncomeYear",
    }
  }
  const buildHmiHeadersForMultipleAmis = () => {
    const headers = {
      householdSize: "t.householdSize",
    }
    amiCharts.forEach((chart) => {
      headers[`ami${chart.percent}`] = `${chart.percent}% AMI`
    })
    return headers
  }

  if (fetchedAmiCharts && amiCharts.length === 1 && minMaxOccupancies.min) {
    buildHmiChartsForOneAmi()
    HMITableHeaders = buildHmiHeadersForOneAmi()
  }

  if (fetchedAmiCharts && amiCharts.length > 1 && minMaxOccupancies.min) {
    buildHmiChartsForMultipleAmis()
    HMITableHeaders = buildHmiHeadersForMultipleAmis()
  }

  return (
    <>
      {!isHabitatListing(listing) && (
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
      )}
    </>
  )
}
