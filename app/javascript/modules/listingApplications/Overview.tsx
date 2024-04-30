import React from "react"

import type { ApplicationPageConfig } from "../../util/listingApplicationUtils"

interface Props {
  pageConfig: ApplicationPageConfig
  clickNext: () => void
  clickPrevious: () => void
}

export const Overview = ({ pageConfig, clickNext, clickPrevious }: Props) => {
  console.log(pageConfig)
  return (
    <div>
      <h1>Overview Component</h1>
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
