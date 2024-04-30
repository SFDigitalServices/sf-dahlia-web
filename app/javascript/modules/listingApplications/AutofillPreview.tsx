import React, { useEffect } from "react"

import type { ApplicationPageConfig } from "../../util/listingApplicationUtils"

interface Props {
  pageConfig: ApplicationPageConfig
  clickNext: () => void
  clickPrevious: () => void
}

export const AutofillPreview = ({ pageConfig, clickNext, clickPrevious }: Props) => {
  useEffect(() => {
    const loggedOut = true
    if (loggedOut) clickNext()
  }, [clickNext])

  return (
    <div>
      <h1>Autofill Preview Component</h1>
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
