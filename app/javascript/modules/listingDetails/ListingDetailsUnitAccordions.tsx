import React, { useContext } from "react"
import { ContentAccordion, Icon, StandardTable, t } from "@bloom-housing/ui-components"
import type RailsUnit from "../../api/types/rails/listings/RailsUnit"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import { getPriorityTypeText } from "../../util/listingUtil"
import { filterAvailableUnits } from "./ListingDetailsPricingTable"

export interface UnitGroupType {
  units: RailsUnit[]
  availability: number
  minSqFt: number
  maxSqFt: number
}

const TableHeaders = {
  unit: "listings.features.unit",
  area: "listings.features.area",
  baths: "listings.features.baths",
  floor: "listings.features.floor",
  accessibility: "listings.features.accessibility",
}

const getTableData = (units: RailsUnit[]) => {
  return units.map((unit) => {
    return {
      unit: { content: <span className="font-semibold">{unit.Unit_Number}</span> },
      area: {
        content: (
          <div className="whitespace-nowrap">
            <span className="font-semibold">{unit.Unit_Square_Footage}</span>{" "}
            <span aria-hidden="true">{t("listings.features.sqft")}</span>
            <span className="sr-only">{t("listings.features.squareFeet")}</span>
          </div>
        ),
      },
      baths: { content: <span className="font-semibold">{unit.Number_of_Bathrooms}</span> },
      floor: { content: <span className="font-semibold">{unit.Unit_Floor}</span> },
      accessibility: {
        content: (
          <span className="font-semibold">
            {unit.Priority_Type && getPriorityTypeText(unit.Priority_Type)}
          </span>
        ),
      },
    }
  })
}

type UnitType = {
  units: RailsUnit[]
  availability: number
  minSqFt: number
  maxSqFt: number
}

const sortUnits = (units: RailsUnit[]): Record<RailsUnit["Unit_Type"], UnitType> => {
  return units?.reduce((acc, unit) => {
    if (!acc[unit.Unit_Type]) {
      acc = {
        ...acc,
        [unit.Unit_Type]: {},
      }
    }
    acc[unit.Unit_Type].units = [...(acc[unit.Unit_Type]?.units || []), unit]

    if (!acc[unit.Unit_Type].availability) acc[unit.Unit_Type].availability = 0
    acc[unit.Unit_Type].availability++

    if (!acc[unit.Unit_Type].minSqFt && !acc[unit.Unit_Type].maxSqFt) {
      acc[unit.Unit_Type].minSqFt = unit.Unit_Square_Footage
      acc[unit.Unit_Type].maxSqFt = unit.Unit_Square_Footage
    }
    if (unit.Unit_Square_Footage < acc[unit.Unit_Type].minSqFt) {
      acc[unit.Unit_Type].minSqFt = unit.Unit_Square_Footage
    }
    if (unit.Unit_Square_Footage > acc[unit.Unit_Type].maxSqFt) {
      acc[unit.Unit_Type].maxSqFt = unit.Unit_Square_Footage
    }
    return acc
  }, {})
}

export const ListingDetailsUnitAccordions = () => {
  const { fetchingUnits, fetchedUnits, units } = useContext(ListingDetailsContext)
  const processedUnits = sortUnits(filterAvailableUnits(units))

  if (fetchingUnits || !fetchedUnits) {
    return (
      <div className="flex justify-center">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  const accordions = Object.keys(processedUnits)?.map((unitType) => {
    const unitGroup = processedUnits[unitType]

    return (
      <ContentAccordion
        key={unitType}
        customBarContent={
          <h3 className={"toggle-header-content"}>
            <strong>{t(`listings.unitTypes.${unitType}`)}</strong>:&nbsp;
            {`${unitGroup.availability} ${
              unitGroup.availability === 1
                ? t("listings.features.unit").toLowerCase()
                : t("t.units").toLowerCase()
            }, ${
              unitGroup.minSqFt === unitGroup.maxSqFt
                ? unitGroup.minSqFt
                : `${unitGroup.minSqFt} - ${unitGroup.maxSqFt}`
            } ${t("listings.features.squareFeet")}`}
          </h3>
        }
        customExpandedContent={
          <div>
            <StandardTable headers={TableHeaders} data={getTableData(unitGroup.units)} />
          </div>
        }
        accordionTheme="blue"
        data-testid={"unit-accordion"}
      />
    )
  })

  return <>{accordions}</>
}
