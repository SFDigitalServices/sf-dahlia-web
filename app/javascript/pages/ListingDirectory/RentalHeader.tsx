import {
  LinkButton,
  PageHeader,
  t,
  AppearanceSizeType,
  Button,
  Icon,
} from "@bloom-housing/ui-components"
import React, { Dispatch, SetStateAction } from "react"
import { getEligibilityEstimatorLink, getHelpCalculatingIncomeLink } from "../../util/routeUtil"
import Markdown from "markdown-to-jsx"
import { EligibilityFilters } from "../../api/listingsApiService"
import "./ListingDirectory.scss"
import TextBanner from "./TextBanner"
import "./RentalHeader.scss"

interface DirectoryProps {
  filters: EligibilityFilters
  setFilters: Dispatch<SetStateAction<EligibilityFilters>>
  match: boolean
}

const RentalHeader = (props: DirectoryProps) => {
  const getYearString = () => {
    return props.filters?.income_timeframe === "per_year" ? "per year" : "per month"
  }
  return props.filters ? (
    <>
      <PageHeader title={"Showing matching units for rent"}>
        <h2 className={"eligibility-subheader"}>
          for <span className={"eligibility-subtext"}>{props.filters.household_size}</span> people
          at{" "}
          <span className={"eligibility-subtext"}>
            ${props.filters.income_total.toLocaleString()}
          </span>{" "}
          {getYearString()}
        </h2>
        <p className="mt-2 md:mt-4">
          <LinkButton
            href={getEligibilityEstimatorLink()}
            size={AppearanceSizeType.small}
            className={"mr-1"}
          >
            Edit Eligibility <Icon symbol={"arrowDown"} size={"small"} className={"ml-1"} />
          </LinkButton>
          <Button
            onClick={() => {
              localStorage.removeItem("ngStorage-eligibility_filters")
              props.setFilters(null)
            }}
            size={AppearanceSizeType.small}
          >
            Clear <Icon symbol={"close"} size={"small"} className={"ml-1"} />
          </Button>
        </p>
      </PageHeader>
      <hr />

      {props.match ? (
        <TextBanner
          header={"Matched"}
          content={
            "Based on information you entered, you may be eligible for units at the following property."
          }
        />
      ) : (
        <div className={"flex justify-center"}>
          <div className={"flex px-8 pb-8 max-w-5xl"}>
            <div className={"mt-10 max-w-5xl flex flex-col items-start match-container"}>
              <h2 className={"page-header-subheader"}>No Matches</h2>
              <p className={"page-header-text-block"}>
                Based on information you entered, you don't match any current listings for rent.
              </p>
              <p className={"page-header-text-block"}>
                Click Here for other rental and ownership affordable housing opportunities.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <PageHeader title={t("rentalDirectory.title")} subtitle={t("rentalDirectory.ifYouTellUs")}>
      <p className="mt-4 md:mt-8 mb-2">
        <LinkButton href={getEligibilityEstimatorLink()}>
          {t("rentalDirectory.findMatchingListings")}
        </LinkButton>
      </p>
      <Markdown className="text-sm">
        {t("rentalDirectory.orGetHelpCalculating", { incomeLink: getHelpCalculatingIncomeLink() })}
      </Markdown>
    </PageHeader>
  )
}

export default RentalHeader
