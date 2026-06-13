/* Vendored from @bloom-housing/ui-components src/tables/StandardTable.tsx.
   The `draggable` table variant (react-beautiful-dnd + nanoid + fontawesome
   grip icon) was removed — no call site in this repo uses it. Non-test row/
   cell keys use a module counter instead of nanoid. */
import React, { useState, useEffect } from "react"
import { getTranslationWithArguments } from "./getTranslationWithArguments"

export interface TableHeadersOptions {
  name: string
  mobileReplacement?: string
  className?: string
  icon?: React.ReactNode
}
export interface TableHeaders {
  [key: string]: string | TableHeadersOptions
}

let uniqueIdCounter = 0
const uniqueId = () => {
  uniqueIdCounter += 1
  return `uic-table-${uniqueIdCounter}`
}

export const Row = (props: { id?: string; className?: string; children: React.ReactNode }) => (
  <tr id={props.id} className={props.className}>
    {props.children}
  </tr>
)

export const HeaderCell = (props: { children?: React.ReactNode; className?: string }) => (
  <th className={props.className}>
    <span className={!props.children ? "sr-only" : ""}>
      {props.children || "Actions"}
    </span>
  </th>
)

export const Cell = (props: {
  headerLabel?: string | TableHeadersOptions
  className?: string
  colSpan?: number
  children: React.ReactNode
  mobileReplacement?: string | React.ReactNode
}) => (
  <td
    data-label={props.headerLabel instanceof Object ? props.headerLabel?.name : props.headerLabel}
    data-cell={props.mobileReplacement}
    className={props.className || "p-5"}
    colSpan={props.colSpan}
  >
    {props.children}
  </td>
)

export const TableThumbnail = (props: { children: React.ReactNode }) => {
  return <span className="table__thumbnail">{props.children}</span>
}

export type StandardTableCell = {
  /** The main content of the cell */
  content: React.ReactNode
  /** Text content that will replace this cell's header on mobile views */
  mobileReplacement?: string
  /** Classname to apply to this row */
  rowClass?: string
}

export type StandardTableData = Record<string, StandardTableCell>[]

export interface StandardTableProps {
  /** The headers for the table passed as text content with optional settings */
  headers: TableHeaders
  /** The table data passed as records of column name to cell data with optional settings */
  data?: StandardTableData
  /** A class name applied to the wrapper of the table */
  className?: string
  /** A class name applied to the root of the table */
  tableClassName?: string
  /** A class name applied to each cell */
  cellClassName?: string
  /** If the table should collapse on mobile views to show repeating columns on the left for every row */
  responsiveCollapse?: boolean
  /** If cell text should be translated or left raw */
  translateData?: boolean
  /** An id applied to the table */
  id?: string
  /** An accessible label applied to the table */
  ariaLabel?: string
}

const headerName = (header: string | TableHeadersOptions): string => {
  return typeof header === "string" ? header : header.name
}
const headerClassName = (header: string | TableHeadersOptions) => {
  return typeof header === "string" ? "" : header.className
}

export const StandardTable = (props: StandardTableProps) => {
  const { headers = {}, cellClassName } = props

  const [tableData, setTableData] = useState<StandardTableData>()

  const headerLabels = Object.values(headers)?.map((header, index) => {
    const uniqKey = process.env.NODE_ENV === "test" ? `header-${index}` : uniqueId()
    return (
      <HeaderCell key={uniqKey} className={headerClassName(header)}>
        {header && header !== "" ? getTranslationWithArguments(headerName(header)) : undefined}
      </HeaderCell>
    )
  })

  useEffect(() => {
    setTableData(props.data)
  }, [props.data])

  const body = tableData?.map((row, dataIndex) => {
    const rowKey = row["id"]
      ? `row-${row["id"].content as string}`
      : (process.env.NODE_ENV === "test"
        ? `standardrow-${dataIndex}`
        : uniqueId())

    let rowClass: string | undefined = ""
    const cols = Object.keys(headers)?.map((colKey, colIndex) => {
      const uniqKey = process.env.NODE_ENV === "test" ? `standardcol-${colIndex}` : uniqueId()
      const cell = row[colKey]?.content
      rowClass = row[colKey]?.rowClass || ""

      const cellClass = [headerClassName(headers[colKey]), cellClassName].join(" ")

      return (
        <Cell
          key={uniqKey}
          headerLabel={
            headers[colKey] && headers[colKey] !== ""
              ? getTranslationWithArguments(headerName(headers[colKey]))
              : headers[colKey]
          }
          className={cellClass !== " " ? cellClass : undefined}
          mobileReplacement={row[colKey]?.mobileReplacement}
        >
          {props.translateData && typeof cell === "string" && cell !== ""
            ? getTranslationWithArguments(cell)
            : cell}
        </Cell>
      )
    })
    return (
      <React.Fragment key={rowKey}>
        <tr id={rowKey} key={rowKey} className={rowClass || ""}>
          {cols}
        </tr>
      </React.Fragment>
    )
  })

  const tableClasses = ["w-full", "text-xs"]
  if (props.responsiveCollapse) {
    tableClasses.push("responsive-collapse")
  }
  if (props.tableClassName) {
    tableClasses.push(props.tableClassName)
  }

  return (
    <div style={{ overflowX: "auto" }} className={props.className}>
      <table id={props.id} aria-label={props.ariaLabel} className={tableClasses.join(" ")}>
        <thead>
          <tr>{headerLabels}</tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}
