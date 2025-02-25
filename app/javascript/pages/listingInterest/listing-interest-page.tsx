import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { FormCard, Heading } from "@bloom-housing/ui-components"
import FormLayout from "../../layouts/FormLayout"
import Link from "../../navigation/Link"
import { AppPages } from "../../util/routeUtil"

interface UrlParams {
  listing: string
  response: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
}

const baysideVillage = {
  name: "Bayside Village",
  agent: "TaJuana Caruthers",
  phoneDisplay: "(216) 273-1159",
  phone: "+12162731159",
  email: "tajuana.caruthers@bpapartments.com",
  removeLinks: true,
}

const listingIdToNameMap = {
  a0W0P00000DZYzVUAX: {
    name: "TEST 1300 22nd (Knox)",
    agent: "Test Test",
    phoneDisplay: "(XXX) XXX-XXXX",
    phone: "+1XXXXXXXXXX",
    email: "test@test.com",
  },
  a0W4U00000KnLRMUA3: {
    name: "1830 Alemany",
    agent: "Brian Minall",
    phoneDisplay: "(415) 647-7191 x127",
    phone: "+14156477191,127",
    email: "brian.minall@caritasmanagement.com",
  },
  a0W4U00000IYEb4UAH: {
    name: "The Canyon",
    agent: "Joshua Schodorf",
    phoneDisplay: "(415) 605-9958",
    phone: "+14156059958",
    email: "bmr@thecanyonsf.com",
  },
  a0W4U00000IYSM4UAP: {
    name: "The Fitzgerald",
    agent: "Lisa Moorehead-Carr",
    phoneDisplay: "(916) 686-4126",
    phone: "+19166864126",
    email: "fitzgeraldbmr@gmail.com",
  },
  a0W4U00000Ih1V2UAJ: {
    name: "Ventana Residences",
    agent: "Sara Lipowsky",
    phoneDisplay: "(209) 809-4112",
    phone: "+12098094112",
    email: "ventanabmr@gmail.com",
  },
  a0W4U00000KnCZRUA3: {
    name: "The George",
    agent: "Lisa Moorehead-Carr",
    phoneDisplay: "(916) 686-4126",
    phone: "+19166864126",
    email: "imaginethatconsulting@gmail.com",
  },
  a0W4U00000NlYn3UAF: baysideVillage,
  a0W4U00000NlTJxUAN: baysideVillage,
  a0W4U00000IYLReUAP: baysideVillage,
}

const headingListingLink = (listing) => {
  const component = listingIdToNameMap[listing].removeLinks ? (
    <></>
  ) : (
    <Link href={`/listings/${listing}`} target="_blank">
      Go to building details
    </Link>
  )
  return component
}

const leasingAgentListingLink = (listing) => {
  const component = listingIdToNameMap[listing].removeLinks ? (
    listingIdToNameMap[listing].name
  ) : (
    <Link href={`/listings/${listing}`}>{listingIdToNameMap[listing].name}</Link>
  )
  return component
}

const ListingInterestPage = (_props: HomePageProps) => {
  return (
    <FormLayout>
      {_props.urlParams.response !== "e" && (
        <FormCard
          header={
            <Heading priority={1}>{listingIdToNameMap[_props.urlParams.listing].name}</Heading>
          }
        >
          {headingListingLink(_props.urlParams.listing)}
        </FormCard>
      )}
      {_props.urlParams.response === "y" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">Thank you for your response</div>
            <div className="mt-4 text-sm">
              You answered: <span className="font-bold">Yes, I'm still interested</span>
            </div>
          </div>
          <div className="p-8 bg-blue-100">
            <span className="font-bold">What to expect</span>
            <ul className="p-4 space-y-4 list-disc">
              <li>
                The leasing agent will contact you when it's your turn to move forward with your
                application.
              </li>
              <li>We will send you an email to let you know once all units get leased.</li>
              <li>
                We will contact you again if more units become available in the next 12 months.
              </li>
            </ul>
            <Link external href="https://www.sf.gov/after-rental-housing-lottery" target="_blank">
              Learn more about what happens after the housing lottery.
            </Link>
          </div>
        </div>
      )}
      {_props.urlParams.response === "n" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">Thank you for your response</div>
            <div className="mt-4 text-sm">
              You answered: <span className="font-bold">No, withdraw my application</span>
            </div>
          </div>
        </div>
      )}
      {_props.urlParams.response === "x" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">The deadline to respond has already passed</div>
            <div className="mt-4 text-sm">Your answer was not submitted</div>
          </div>
          <div className="p-8 bg-blue-100">
            <p>
              If you are still interested in an apartment at{" "}
              {leasingAgentListingLink(_props.urlParams.listing)}
              <span className="text-neutral-600">, contact: </span>
            </p>
            <ul className="mt-6">
              <li>
                <span className="text-lg leading-6">
                  {listingIdToNameMap[_props.urlParams.listing].agent}
                </span>
              </li>
              <li>
                <a href={`tel:${listingIdToNameMap[_props.urlParams.listing].phone}`}>
                  {listingIdToNameMap[_props.urlParams.listing].phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${listingIdToNameMap[_props.urlParams.listing].email}`}>
                  {listingIdToNameMap[_props.urlParams.listing].email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
      {_props.urlParams.response === "e" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">ERROR</div>
            <div className="mt-4 text-sm">INVALID REQUEST</div>
          </div>
        </div>
      )}
    </FormLayout>
  )
}

export default withAppSetup(ListingInterestPage, { pageName: AppPages.ListingInterest })
