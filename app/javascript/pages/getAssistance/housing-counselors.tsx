import {
  t,
  Icon,
  IconFillColors,
  Tag,
  AppearanceSizeType,
  Desktop,
  Mobile,
  Button,
} from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import "./housing-counselors.scss"
import housingCounselorsList from "../../../assets/json/housing_counselors_react.json"

interface CounselorData {
  fullName: string
  shortName?: string
  services: string[]
  languages: string[]
  address: string
  cityState: string
  website: string
  email: string
  phone: string
}

const Label = (type: "language" | "service", text: string) => {
  return (
    <span key={text}>
      <Tag className={type} size={AppearanceSizeType.small}>
        {text}
      </Tag>
    </span>
  )
}

const HousingCounselor = (housingCounselor: CounselorData) => {
  return (
    <div className="resource-item text-base m-4" key={housingCounselor.fullName}>
      <h3 className="font-sans text-lg pb-2">{housingCounselor.fullName}</h3>
      <p className="text-xs text-gray-800 pb-2 flex flex-wrap gap-1">
        {t("assistance.housingCounselors.servicesOffered")}
        {housingCounselor.services.map((service) =>
          Label("service", t(`assistance.housingCounselors.services.${service}`))
        )}
      </p>
      <p className="text-xs text-gray-800 pb-4 flex flex-wrap gap-1">
        {t("assistance.housingCounselors.languagesSpoken")}
        {housingCounselor.languages.map((language) =>
          Label("language", t(`assistance.housingCounselors.services.languages.${language}`))
        )}
      </p>

      <p className="icon-item pb-2 flex">
        <Icon className="address-icon" symbol="map" size="medium" />
        <span>
          {housingCounselor.address} <br /> {housingCounselor.cityState}
        </span>
      </p>
      <Mobile>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            icon="phone"
            iconPlacement="left"
            size={AppearanceSizeType.small}
            iconSize="medium"
          >
            {t("assistance.housingCounselors.counselor.call.upper", {
              phoneNumber: housingCounselor.phone,
            })}
          </Button>
          <Button
            size={AppearanceSizeType.small}
            icon={faEnvelope}
            iconPlacement="left"
            iconSize="medium"
          >
            {t("assistance.housingCounselors.counselor.email.upper", {
              counselorName: housingCounselor.shortName || housingCounselor.fullName,
            })}
          </Button>
          <Button
            size={AppearanceSizeType.small}
            icon="link"
            iconPlacement="left"
            iconSize="medium"
          >
            {t("assistance.housingCounselors.counselor.visitWebsite.upper", {
              counselorName: housingCounselor.shortName || housingCounselor.fullName,
            })}
          </Button>
        </div>
      </Mobile>
      <Desktop>
        <a className="icon-item pb-2" href={`tel:+1${housingCounselor.phone}`}>
          <Icon
            className="counselor-icon"
            symbol="phone"
            size="medium"
            fill={IconFillColors.primary}
          />
          {t("assistance.housingCounselors.counselor.call.lower", {
            phoneNumber: housingCounselor.phone,
          })}
        </a>

        <a className="icon-item pb-2" href={`mailto:${housingCounselor.email}`}>
          <Icon
            className="counselor-icon"
            symbol={faEnvelope}
            size="medium"
            fill={IconFillColors.primary}
          />
          {t("assistance.housingCounselors.counselor.email.lower", {
            counselorEmail: housingCounselor.email,
          })}
        </a>

        {housingCounselor.website && (
          <a
            className="icon-item"
            target="_blank"
            rel="noreferrer noopener"
            href={housingCounselor.website}
          >
            <Icon
              className="counselor-icon"
              symbol="link"
              size="medium"
              fill={IconFillColors.primary}
            />
            {t("assistance.housingCounselors.counselor.visitWebsite.lower", {
              counselorName: housingCounselor.shortName || housingCounselor.fullName,
            })}
          </a>
        )}
      </Desktop>
    </div>
  )
}

const HousingCounselors = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.housingCouneslors")}
      subtitle={t("assistance.subtitle.housingCouneslors")}
    >
      {housingCounselorsList.counselors.map((counselor) => HousingCounselor(counselor))}
    </AssistanceLayout>
  )
}

export default withAppSetup(HousingCounselors)
