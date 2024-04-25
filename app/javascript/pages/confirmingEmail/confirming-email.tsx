import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { FormCard, Heading } from "@bloom-housing/ui-components"
import FormLayout from "../../layouts/FormLayout"
import Link from "../../navigation/Link"

interface UrlParams {
  listing: string
  response: string
}

// TODO: rename props & types
interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
}

// TODO: map here vs in rails email_controller.rb?
// TODO: what happens if passed invalid listing, or any other params?
// TODO: leave hardcoded leasing agent info in code?
// TODO: do href phone links use extensions
const listingIdToNameMap = {
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
}

const ConfirmingEmail = (_props: HomePageProps) => {
  // TODO: remove hardcoding, including token expired leasing agent contact
  // TODO: sfgov translations links
  // TODO: deadline to respond leasing agent links, what happens if invalid or missing listing passed?
  // TODO: move strings to json files and translate, translation routes
  // TODO: move css to css file
  // TODO: custom JSX (move to own components) vs bloom
  // TODO: response type for error or invalid token (x?)
  // TODO: contnet change for yes response
  // TODO: content for error page

  console.log("_props")
  console.log(_props)

  return (
    <FormLayout>
      {_props.urlParams.response !== "e" && (
        <FormCard
          header={
            <Heading priority={1}>{listingIdToNameMap[_props.urlParams.listing].name}</Heading>
          }
        >
          <Link href={`/listings/${_props.urlParams.listing}`}>Go to building details</Link>
        </FormCard>
      )}
      {_props.urlParams.response === "y" && (
        <div className="flex flex-col py-px mt-4 max-w-full bg-white rounded-lg border border-solid border-zinc-200 w-[512px]">
          <div className="flex flex-col px-20 pt-8 pb-8 text-center border-b border-solid border-zinc-200 max-md:px-5 max-md:max-w-full">
            <div className="text-2xl text-neutral-800">Thank you for your response</div>
            <div className="self-center mt-4 text-sm leading-4 text-black">
              You answered: <span className="font-bold text-black">Yes, I'm still interested</span>
            </div>
          </div>
          <div className="justify-center p-8 text-base leading-6 text-sky-700 bg-slate-50 max-md:px-5 max-md:max-w-full">
            <span className="font-bold">What to expect</span>
            <br />
            <ul style={{ listStyleType: "disc" }}>
              <li>Other applicants may be ahead of you in the original lottery order.</li>
              <li>
                Depending on how many units are still available, you might not get contacted about
                moving forward with your application.
              </li>
            </ul>
            <a
              href="https://www.sf.gov/after-rental-housing-lottery"
              className="text-sky-700"
              target="_blank"
            >
              Learn more about what happens after the housing lottery.
            </a>
          </div>
        </div>
      )}
      {_props.urlParams.response === "n" && (
        <div className="flex flex-col py-px mt-4 max-w-full bg-white rounded-lg border border-solid border-zinc-200 w-[512px]">
          <div className="flex flex-col px-20 pt-8 pb-8 text-center border-b border-solid border-zinc-200 max-md:px-5 max-md:max-w-full">
            <div className="text-2xl text-neutral-800">Thank you for your response</div>
            <div className="self-center mt-4 text-sm leading-4 text-black">
              You answered:{" "}
              <span className="font-bold text-black">No, withdraw my application</span>
            </div>
          </div>
        </div>
      )}
      {_props.urlParams.response === "x" && (
        <div className="flex flex-col py-px mt-4 max-w-full bg-white rounded-lg border border-solid border-zinc-200 w-[512px]">
          <div className="flex flex-col px-8 pt-8 pb-8 text-center border-b border-solid border-zinc-200 max-md:px-5 max-md:max-w-full">
            <div className="text-2xl leading-8 text-neutral-800 max-md:max-w-full">
              The deadline to respond has already passed{" "}
            </div>
            <div className="self-center mt-4 text-sm text-neutral-600">
              Your answer was not submitted
            </div>
          </div>
          <div className="justify-center p-8 text-base leading-6 bg-slate-50 text-neutral-600 max-md:px-5 max-md:max-w-full">
            If you are still interested in an apartment at{" "}
            <Link href={`/listings/${_props.urlParams.listing}`}>
              {listingIdToNameMap[_props.urlParams.listing].name}
            </Link>
            <span className="text-neutral-600">, contact: </span>
            <br />
            <br />
            <span className="text-lg leading-6">Sara Lipowsky</span>
            <br />
            <a href={`tel:${listingIdToNameMap[_props.urlParams.listing].phone}`}>
              {listingIdToNameMap[_props.urlParams.listing].phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${listingIdToNameMap[_props.urlParams.listing].email}`}>
              {listingIdToNameMap[_props.urlParams.listing].email}
            </a>
          </div>
        </div>
      )}
      {_props.urlParams.response === "e" && (
        <div className="flex flex-col py-px mt-4 max-w-full bg-white rounded-lg border border-solid border-zinc-200 w-[512px]">
          <div className="flex flex-col px-8 pt-8 pb-8 text-center border-b border-solid border-zinc-200 max-md:px-5 max-md:max-w-full">
            <div className="text-2xl leading-8 text-neutral-800 max-md:max-w-full">ERROR</div>
            <div className="self-center mt-4 text-sm text-neutral-600">INVALID REQUEST</div>
          </div>
        </div>
      )}
    </FormLayout>
  )
}

export default withAppSetup(ConfirmingEmail)
