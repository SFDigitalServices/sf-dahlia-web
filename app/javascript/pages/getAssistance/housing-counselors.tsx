import { t, Icon, IconFillColors, Tag, AppearanceSizeType } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import "./housing-counselors.scss"
// Counselors can help you with your DAHLIA application and housing search.

export interface HousingCounselorProps {
  addressCityState?: string
  addressStreet?: string
  languages: string[]
  services: string[]
  name: string
  phoneNumber: string
  emailAddress: string
  website: string
  callButtonText: string
  emailButtonText: string
  visitButtonText: string
}

const Label = (type: "language" | "service", text: string) => {
  return (
    <span className="mx-1" key={text}>
      <Tag className={type} size={AppearanceSizeType.small}>
        {text}
      </Tag>
    </span>
  )
}

const HousingCounselor = (props: HousingCounselorProps) => {
  return (
    <div className="resource-item text-base m-4">
      <h3 className="font-sans text-lg pb-2">{props.name}</h3>
      <p className="text-xs text-gray-800 pb-2">
        Services Offered:
        {props.services.map((service) => Label("service", service))}
      </p>
      <p className="text-xs text-gray-800 pb-4">
        Languages Spoken:
        {props.languages.map((language) => Label("language", language))}
      </p>

      <p className="icon-item pb-2 flex">
        <Icon className="address-icon" symbol="map" size="medium" />
        <span>
          {props.addressStreet} <br /> {props.addressCityState}
        </span>
      </p>

      <a className="icon-item pb-2" href={`tel:+1${props.phoneNumber}`}>
        <Icon
          className="counselor-icon"
          symbol="phone"
          size="medium"
          fill={IconFillColors.primary}
        />
        {props.callButtonText}
      </a>

      <a className="icon-item pb-2" href={`mailto:${props.emailAddress}`}>
        <Icon
          className="counselor-icon"
          symbol={faEnvelope}
          size="medium"
          fill={IconFillColors.primary}
        />
        {props.emailButtonText}
      </a>

      {props.website && (
        <a className="icon-item" target="_blank" href={props.website}>
          <Icon
            className="counselor-icon"
            symbol="link"
            size="medium"
            fill={IconFillColors.primary}
          />
          {props.visitButtonText}
        </a>
      )}
    </div>
  )
}

const HousingCounselors = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.housingCouneslors")}
      subtitle={t("assistance.subtitle.housingCouneslors")}
    >
      <HousingCounselor
        name="ASIAN INC"
        languages={["Cantonese", "English", "Mandarin"]}
        services={["Rental", "Ownership"]}
        callButtonText="Call (415) 928–5910"
        phoneNumber={"4159285910"}
        emailAddress="housing.counseling@asianinc.org"
        website="https://www.asianinc.org/housing/"
        emailButtonText="Email housing.counseling@asianinc.org"
        visitButtonText="Visit ASIAN INC"
        addressCityState="San Francisco, CA 94103"
        addressStreet="1167 Mission Street, 4th Floor"
      />
    </AssistanceLayout>
  )
}

export default withAppSetup(HousingCounselors)
