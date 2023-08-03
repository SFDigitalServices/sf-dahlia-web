import React, { useState } from "react"
import {
  AppearanceStyleType,
  Button,
  Heading,
  Select,
  Form,
  t,
  FieldGroup,
} from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import "./counselor-filter.scss"

interface CounselorFilterProps {
  handleFilterData: (filterData: {
    language: string
    services: string[]
    clearClicked: boolean
  }) => void
}

const CounselorFilter = ({ handleFilterData }: CounselorFilterProps) => {
  const SERVICES_DATA = [
    {
      label: t("assistance.housingCounselors.findACounselor.filter.rentalServices"),
      id: "rental",
    },
    {
      label: t("assistance.housingCounselors.findACounselor.filter.ownershipServices"),
      id: "ownership",
    },
    {
      label: t("assistance.housingCounselors.findACounselor.filter.seniorOnlyServices"),
      id: "seniorOnly",
    },
  ]
  const LANGUAGES_DATA = [
    {
      label: t("assistance.housingCounselors.findACounselor.filter.selectPlaceholder.anyLangauge"),
      value: "any",
    },
    { label: t("assistance.housingCounselors.services.languages.arabic"), value: "arabic" },
    { label: t("assistance.housingCounselors.services.languages.cantonese"), value: "cantonese" },
    { label: t("assistance.housingCounselors.services.languages.english"), value: "english" },
    { label: t("assistance.housingCounselors.services.languages.filipino"), value: "filipino" },
    { label: t("assistance.housingCounselors.services.languages.french"), value: "french" },
    { label: t("assistance.housingCounselors.services.languages.spanish"), value: "spanish" },
    { label: t("assistance.housingCounselors.services.languages.mandarin"), value: "mandarin" },
    { label: t("assistance.housingCounselors.services.languages.russian"), value: "russian" },
    { label: t("assistance.housingCounselors.services.languages.vietnamese"), value: "vietnamese" },
  ]
  // TODO(DAH-1575)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { language: LANGUAGES_DATA[0].value, services: [] },
  })
  const [clearButton, setClearButton] = useState(false)
  const onSubmit = (data) => {
    setClearButton(true)
    handleFilterData({
      language: data.language,
      services: data.services,
      clearClicked: false,
    })
  }
  const updateClearButton = () => {
    setClearButton(false)
    reset()
    handleFilterData({
      language: LANGUAGES_DATA[0].value,
      services: [],
      clearClicked: true,
    })
  }
  return (
    <div>
      <Heading priority={2}>{t("assistance.housingCounselors.findACounselor.title")}</Heading>
      <p className="text-base my-4">{t("assistance.housingCounselors.findACounselor.subtitle")}</p>
      <Form className="bg-blue-100 mb-6 md:mb-9 p-6" onSubmit={handleSubmit(onSubmit)}>
        <Heading className="text-gray-950" priority={2} styleType={"underlineWeighted"}>
          {t("assistance.housingCounselors.findACounselor.filter")}
        </Heading>
        <div>
          <Select
            name="language"
            id="language"
            label={t("assistance.housingCounselors.findACounselor.filter.language")}
            options={LANGUAGES_DATA}
            register={register}
            placeholder={LANGUAGES_DATA[0].label}
            controlClassName="mt-2"
          />
        </div>
        <FieldGroup
          register={register}
          name={"services"}
          type={"checkbox"}
          fields={SERVICES_DATA}
          fieldClassName={"service-checkbox"}
        />
        <div className="flex flex-col w-40 mt-5 md:w-auto md:flex-row gap-4">
          <Button type="submit" styleType={AppearanceStyleType.primary}>
            {t("assistance.housingCounselors.findACounselor.filter.apply")}
          </Button>
          {clearButton ? (
            <Button type="reset" onClick={() => updateClearButton()}>
              {t("assistance.housingCounselors.findACounselor.filter.clear")}
            </Button>
          ) : null}
        </div>
      </Form>
    </div>
  )
}

export default CounselorFilter
