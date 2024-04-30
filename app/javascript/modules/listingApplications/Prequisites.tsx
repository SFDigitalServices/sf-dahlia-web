import React from "react"

import type { ApplicationPageConfig } from "../../util/listingApplicationUtils"

interface Props {
  pageConfig: ApplicationPageConfig
  clickNext: () => void
  clickPrevious: () => void
}

export const Prequisites = ({ pageConfig, clickNext, clickPrevious }: Props) => {
  return (
    <div>
      <h1>Prequisites Component</h1>
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
