import { t } from "@bloom-housing/ui-components"
import React from "react"

type TableSubHeaderProps = {
  priorityTypes: string[] | null
}

const TableSubHeader = ({ priorityTypes }: TableSubHeaderProps) => {
  return (
    priorityTypes && (
      <div>
        {t("listings.includesPriorityUnits")}
        <ul className="list-disc ml-4">
          {priorityTypes.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    )
  )
}

export default TableSubHeader
