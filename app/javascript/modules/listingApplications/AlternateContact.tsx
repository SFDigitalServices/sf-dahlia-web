import React, { useState } from "react"

import type { ApplicationPageConfig } from "../../util/listingApplicationUtils"

interface Props {
  pageConfig: ApplicationPageConfig
  clickNext: () => void
  clickPrevious: () => void
}

export const AlternateContact = ({ pageConfig, clickNext, clickPrevious }: Props) => {
  const [currentPage, setCurrentPage] = useState(0)

  const Page1 = () => {
    return (
      <div>
        <h1>Alternate Contact Component Part 1</h1>
        <p>{JSON.stringify(pageConfig)}</p>
        <p>
          <button className="button" onClick={() => setCurrentPage(1)}>
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

  const Page2 = () => {
    return (
      <div>
        <h1>Alternate Contact Component Part 2</h1>
        <p>{JSON.stringify(pageConfig)}</p>
        <p>
          <button className="button" onClick={() => setCurrentPage(2)}>
            next
          </button>
        </p>
        <p>
          <button className="button" onClick={() => setCurrentPage(0)}>
            previous
          </button>
        </p>
      </div>
    )
  }

  const Page3 = () => {
    return (
      <div>
        <h1>Alternate Contact Component Part 3</h1>
        <p>{JSON.stringify(pageConfig)}</p>
        <p>
          <button className="button" onClick={clickNext}>
            next
          </button>
        </p>
        <p>
          <button className="button" onClick={() => setCurrentPage(1)}>
            previous
          </button>
        </p>
      </div>
    )
  }

  const getPage = () => {
    const Page = [Page1, Page2, Page3][currentPage]

    return <Page />
  }

  return <>{getPage()}</>
}
