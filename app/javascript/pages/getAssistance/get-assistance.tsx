import { ActionBlock, Icon, t, Heading } from "@bloom-housing/ui-components"
import Link from "../../navigation/Link"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import {
  faClipboardList,
  faHouseChimney,
  faDoorOpen,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons"
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import bloomTheme from "../../../../tailwind.config"

const GetAssistance = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.getAssistance")}
      subtitle={t("assistance.subtitle.getAssistance")}
      mainPage={true}
    >
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.housingCouneslors")}</Heading>}
        subheader={t("assistance.subtitle.housingCouneslors")}
        background="none"
        icon={<Icon size="2xl" symbol={faPeopleGroup} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <Link
            key="housing-counselors"
            className="button"
            external={true}
            href={"/housing-counselors"}
            target="_blank"
          >
            {t("housingCounselor.findAHousingCounselor")}
          </Link>,
        ]}
      />
      <ActionBlock
        header={
          <Heading priority={2}>{t("assistance.title.additionalHousingOpportunities")}</Heading>
        }
        subheader={t("assistance.subtitle.additionalHousingOpportunities")}
        background="primary-lighter"
        icon={
          <Icon size="2xl" symbol={faHouseChimney} fill={bloomTheme.theme.colors.gray["750"]} />
        }
        actions={[
          <Link
            key="additional-resources"
            className="button w-3/4 md:w-auto"
            external={true}
            href={"/additional-resources"}
            target="_blank"
          >
            {t("assistance.title.additionalHousingOpportunities.button")}
          </Link>,
        ]}
      />
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.sfServices")}</Heading>}
        subheader={t("assistance.subtitle.sfServices")}
        background="none"
        icon={<Icon size="2xl" symbol={faDoorOpen} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <Link
            key="sf-services"
            className="button"
            external={true}
            href={"https://sfserviceguide.org/"}
            target="_blank"
          >
            {t("assistance.title.sfServices.button")}
          </Link>,
        ]}
      />
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.documentChecklist")}</Heading>}
        subheader={t("assistance.subtitle.documentChecklist")}
        background="primary-lighter"
        icon={
          <Icon size="2xl" symbol={faClipboardList} fill={bloomTheme.theme.colors.gray["750"]} />
        }
        actions={[
          <Link
            key="document-checklist"
            className="button"
            external={true}
            href={"/document-checklist"}
            target="_blank"
          >
            {t("label.viewDocumentChecklist")}
          </Link>,
        ]}
      />
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.dahliaVideos")}</Heading>}
        subheader={t("assistance.subtitle.dahliaVideos")}
        background="none"
        icon={<Icon size="2xl" symbol={faYoutube} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <Link
            key="dahlia-videos"
            className="button"
            external={true}
            href={"https://www.youtube.com/playlist?list=PL7dcWHJTcA51TBqhghJ9LfSGEGoFB7aWG"}
            target="_blank"
          >
            {t("assistance.title.dahliaVideos.button")}
          </Link>,
        ]}
      />
    </AssistanceLayout>
  )
}

export default withAppSetup(GetAssistance)
