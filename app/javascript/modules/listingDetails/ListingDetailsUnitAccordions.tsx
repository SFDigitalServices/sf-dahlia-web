import React, { useEffect, useState, useContext } from "react"
import { ContentAccordion, Icon, StandardTable, t } from "@bloom-housing/ui-components"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"

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

const getPriorityTypeText = (priorityType) => {
  switch (priorityType) {
    case "Adaptable":
      return ""
    case "Hearing Impairments":
      return t("listings.prioritiesDescriptor.hearing")
    case "Vision and/or Hearing Impairments":
      return t("listings.prioritiesDescriptor.hearingVision")
    case "Mobility Impairments":
      return t("listings.prioritiesDescriptor.mobility")
    case "Mobility, Hearing and/or Vision Impairments":
      return t("listings.prioritiesDescriptor.mobilityHearingVision")
    case "Vision Impairments":
      return t("listings.prioritiesDescriptor.vision")
    default:
      return ""
  }
}

const getTableData = (units: RailsUnit[]) =>
  units.map((unit) => ({
    unit: { content: <span className="font-semibold">{unit.Unit_Number}</span> },
    area: {
      content: (
        <>
          <span className="font-semibold">{unit.Unit_Square_Footage}</span>{" "}
          <span aria-hidden="true">{t("listings.features.sqft")}</span>
          <span className="sr-only">{t("listings.features.squareFeet")}</span>
        </>
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
  }))

export const ListingDetailsUnitAccordions = () => {
  const [processedUnits, setUnits] = useState({})
  const { fetchingUnits, fetchedUnits, units } = useContext(ListingDetailsContext)

  useEffect(() => {
    if (fetchedUnits) {
      const sortedUnits = units.reduce((acc, unit) => {
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
      setUnits(sortedUnits)
    }
    return () => {
      setUnits({})
    }
  }, [fetchedUnits, units])

  if (fetchingUnits || !fetchedUnits) {
    return (
      <div className="flex justify-center">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  if (!Object.keys(units)) {
    return null
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
      />
    )
  })

  return <>{accordions}</>
}
