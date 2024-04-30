import React from "react"

import type { ApplicationPageConfig } from "../../util/listingApplicationUtils"

interface Props {
  pageConfig: ApplicationPageConfig
  clickNext: () => void
  clickPrevious: () => void
}

export const CustomEducatorScreening = ({ pageConfig, clickNext, clickPrevious }: Props) => {
  return (
    <div>
      <h1>Custom Educator Screening Component</h1>
      <p>{JSON.stringify(pageConfig)}</p>
      <p>
        <button className="button" onClick={clickNext}>
          next
        </button>
      </p>
      <p>
        <button className="button" onClick={clickPrevious}>
          previous
        </button>
      </p>
    </div>
  )
}
