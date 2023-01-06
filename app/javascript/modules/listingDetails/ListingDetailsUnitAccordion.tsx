import React from "react"
import { ContentAccordion, StandardTable, t } from "@bloom-housing/ui-components"
import { RailsListingUnits } from "../../api/types/rails/listings/RailsListingUnits"

export interface UnitGroupType {
  units: RailsListingUnits[]
  availability: number
  minSqFt: number
  maxSqFt: number
}

export interface ListingDetailsUnitAccordionProps {
  unitType: string
  unitGroup: UnitGroupType
}

const TableHeaders = {
  unit: "listings.features.unit",
  area: "listings.features.area",
  baths: "listings.features.baths",
  floor: "listings.features.floor",
  accessibility: "listings.features.accessibility",
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

export const ListingDetailsUnitAccordion = ({
  unitType,
  unitGroup,
}: ListingDetailsUnitAccordionProps) => (
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
