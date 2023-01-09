import React, { useEffect, useState } from "react"
import { ContentAccordion, Icon, StandardTable, t } from "@bloom-housing/ui-components"
import { getUnits } from "../../api/listingApiService"
import { RailsListingUnits } from "../../api/types/rails/listings/RailsListingUnits"

export interface UnitGroupType {
  units: RailsListingUnits[]
  availability: number
  minSqFt: number
  maxSqFt: number
}

export interface ListingDetailsUnitAccordionsProps {
  listingId: string
}

const TableHeaders = {
  unit: "t.listings.features.unit",
  area: "t.listings.features.area",
  baths: "t.listings.features.baths",
  floor: "t.listings.features.floor",
  accessibility: "t.listings.features.accessibility",
}

const getTableData = (units: RailsListingUnits[]) =>
  units.map((unit) => ({
    unit: { content: <span className="font-semibold">{unit.Unit_Number}</span> },
    area: {
      content: (
        <>
          <span className="font-semibold">{unit.Unit_Square_Footage}</span>
          {t("listings.features.sqft")}
        </>
      ),
    },
    baths: { content: <span className="font-semibold">{unit.Number_of_Bathrooms}</span> },
    floor: { content: <span className="font-semibold">{unit.Unit_Floor}</span> },
    accessibility: {
      content: (
        <span className="font-semibold">
          {unit.Priority_Type && unit.Priority_Type !== "Adaptable" ? unit.Priority_Type : ""}
        </span>
      ),
    },
  }))

export const ListingDetailsUnitAccordions = ({ listingId }: ListingDetailsUnitAccordionsProps) => {
  const [units, setUnits] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    void getUnits(listingId).then((units) => {
      // eslint-disable-next-line unicorn/no-array-reduce
      const sortedUnits = units.reduce((acc, unit) => {
        if (!acc[unit.Unit_Type]) {
          acc = {
            ...acc,
            [unit.Unit_Type]: {},
          }
        }
        acc[unit.Unit_Type].units = [...(acc[unit.Unit_Type]?.units || []), unit]

        if (!acc[unit.Unit_Type].availability) acc[unit.Unit_Type].availability = 0
        acc[unit.Unit_Type].availability += unit.Availability

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
      setLoading(false)
    })
    return () => {
      setLoading(false)
      setUnits({})
    }
  }, [listingId])

  if (loading) {
    return (
      <div className="flex justify-center">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  if (!Object.keys(units)) {
    return null
  }

  const accordions = Object.keys(units)?.map((unitType) => {
    const unitGroup = units[unitType]

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
