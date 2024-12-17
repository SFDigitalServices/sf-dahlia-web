import React from "react"
import "./DirectoryPageNavigationBar.scss"
import { Button } from "@bloom-housing/ui-seeds"
import { Icon } from "@bloom-housing/ui-components"

const DirectoryPageNavigationBar = ({
  directoryType,
  listingLengths,
  activeItem,
  setActiveItem,
}: {
  directoryType: string
  listingLengths: { open: number; upcoming: number; fcfs: number; results: number }
  activeItem: string
  setActiveItem: React.Dispatch<string>
}) => {
  return (
    <div className="directory-page-navigation-bar">
      <Button
        onClick={() => {
          document.querySelector("#enter-a-lottery").scrollIntoView({ behavior: "smooth" })
          setActiveItem("enter-a-lottery")
        }}
        className={activeItem === "enter-a-lottery" ? "active" : ""}
      >
        <Icon size="medium" symbol="house" />
        Enter a lottery ({listingLengths.open})
      </Button>
      {directoryType === "forSale" && (
        <Button
          onClick={() => {
            document.querySelector("#buy-now").scrollIntoView({ behavior: "smooth" })
            setActiveItem("buy-now")
          }}
          className={activeItem === "buy-now" ? "active" : ""}
        >
          <Icon size="medium" symbol="house" />
          Buy now ({listingLengths.fcfs})
        </Button>
      )}
      <Button
        onClick={() => {
          document.querySelector("#upcoming-lotteries").scrollIntoView({ behavior: "smooth" })
          setActiveItem("upcoming-lotteries")
        }}
        className={activeItem === "upcoming-lotteries" ? "active" : ""}
      >
        <Icon size="medium" symbol="clock" />
        Upcoming lotteries ({listingLengths.upcoming})
      </Button>
      <Button
        onClick={() => {
          document.querySelector("#lottery-results").scrollIntoView({ behavior: "smooth" })
          setActiveItem("lottery-results")
        }}
        className={activeItem === "lottery-results" ? "active" : ""}
      >
        <Icon size="medium" symbol="clock" />
        Lottery results ({listingLengths.results})
      </Button>
    </div>
  )
}
export default DirectoryPageNavigationBar
