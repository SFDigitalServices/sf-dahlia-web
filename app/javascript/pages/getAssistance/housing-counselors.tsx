import {
  t,
  Icon,
  IconFillColors,
  Tag,
  AppearanceSizeType,
  Desktop,
  Mobile,
  Button,
  Heading,
} from "@bloom-housing/ui-components"
import React, { useState } from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import "./housing-counselors.scss"
import housingCounselorsList from "../../../assets/json/housing_counselors_react.json"
import CounselorFilter from "./counselor-filter"
import { renderInlineMarkup } from "../../util/languageUtil"

const HOMEOWNERSHIP_SF = {
  fullName: "Homeownership SF (Rentals and Ownership)",
  shortName: "Homeownership SF",
  services: ["rental", "ownership"],
  languages: ["english", "filipino", "spanish"],
  address: "275 5th Street #314",
  cityState: "San Francisco, CA 94103",
  website: "https://www.homeownershipsf.org/",
  email: "info@homeownershipsf.org",
  phone: "(415) 202-5464",
}

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
    <div
      className="resource-item text-base pb-4 mt-2 border-b border-gray-450 last:border-b-0 md:p-4 md:pt-0 md:pb-8 md:mt-8"
      key={housingCounselor.fullName}
    >
      <h3 className="font-sans text-lg pb-2">{housingCounselor.fullName}</h3>
      <p className="text-xs text-gray-800 pb-2 flex flex-wrap gap-1">
        {t("assistance.housingCounselors.servicesOffered")}
        {housingCounselor.services.map((service) =>
          Label("service", t(`assistance.housingCounselors.services.${service}`))
        )}
      </p>
      <p className="text-xs text-gray-800 flex flex-wrap gap-1">
        {t("assistance.housingCounselors.languagesSpoken")}
        {housingCounselor.languages.map((language) =>
          Label("language", t(`assistance.housingCounselors.services.languages.${language}`))
        )}
      </p>

      <p className="icon-item flex mt-4">
        <Icon className="address-icon" symbol="map" size="medium" />
        <span>
          {housingCounselor.address} <br /> {housingCounselor.cityState}
        </span>
      </p>
      <Mobile>
        <div className="flex flex-col gap-2 mt-4 mb-2">
          <Button
            icon="phone"
            iconPlacement="left"
            size={AppearanceSizeType.small}
            iconSize="medium"
            onClick={() => {
              window.location.href = `tel:+1${housingCounselor.phone}`
            }}
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
            onClick={() => {
              window.open(`mailto:${housingCounselor.email}`)
            }}
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
            onClick={() => {
              window.open(housingCounselor.website, "_blank")
            }}
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
  const getResults = (num: number) => {
    switch (num) {
      case housingCounselorsList.counselors.length: {
        return t("assistance.housingCounselors.findACounselor.filter.all")
      }
      case 1: {
        return t("assistance.housingCounselors.findACounselor.filter.singular")
      }
      case 0: {
        return (
          <div>
            {t("assistance.housingCounselors.findACounselor.filter.zero.part1")}
            <br /> <br />
            {renderInlineMarkup(t("assistance.housingCounselors.findACounselor.filter.zero.part2"))}
          </div>
        )
      }
      default: {
        return t("assistance.housingCounselors.findACounselor.filter.results", {
          num: num,
        })
      }
    }
  }
  const [filterData, setFilterData] = useState({
    language: "any",
    services: [],
  })

  const filteredList = React.useMemo(() => {
    let filteredList = housingCounselorsList.counselors
    if (filterData.language !== "any") {
      filteredList = filteredList.filter((counselor) => {
        return counselor.languages.includes(filterData.language)
      })
    }
    if (filterData.services.length > 0) {
      filteredList = filteredList.filter((counselor) => {
        return counselor.services.some((service) => filterData.services.includes(service))
      })
    }
    return filteredList
  }, [filterData])

  return (
    <AssistanceLayout
      title={t("assistance.title.housingCouneslors")}
      subtitle={t("assistance.subtitle.housingCouneslors")}
    >
      <div className="page-main">
        <div className="md:mr-8 md:mb-2 md:mt-4">
          <div id="homeownership-sf" className="m-6 mb-2 md:m-0 md:mb-0 md:mt-12">
            <Heading priority={2}>{t("assistance.housingCounselors.startHere.title")}</Heading>
            <p className="text-base my-4">{t("assistance.housingCounselors.startHere.subtitle")}</p>
            {HousingCounselor(HOMEOWNERSHIP_SF)}
          </div>
          <div className="border-b w-full border-gray-500 md:my-9" />
          <div className="px-6 pt-6 md:pl-0 md:mt-12">
            <CounselorFilter
              handleFilterData={setFilterData}
              clearClick={() => {
                setFilterData({ language: "any", services: [] })
              }}
            />
          </div>
          <div className="flex flex-col m-6 md:m-0">
            <Heading priority={3} className="text-lg">
              {getResults(filteredList.length)}
            </Heading>
            {filteredList.map((counselor) => HousingCounselor(counselor))}
          </div>
        </div>
      </div>
    </AssistanceLayout>
  )
}

export default withAppSetup(HousingCounselors)
