import { ActionBlock, Icon, t, Heading, LinkButton } from "@bloom-housing/ui-components"
import { Link as RouterLink } from "react-router"
import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import {
  faClipboardList,
  faHouseChimney,
  faDoorOpen,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons"
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import bloomTheme from "../../../../tailwind.config"
import {
  AppPages,
  getAdditionalResourcesPath,
  getDocumentChecklistPath,
  getHousingCounselorsPath,
} from "../../util/routeUtil"
import HeaderSidebarLayout from "../../layouts/HeaderSidebarLayout"
import ContactSideBarBlock from "../../layouts/Sidebar/ContactSidebarBlock"

const GetAssistance = () => {
  return (
    <HeaderSidebarLayout
      title={t("assistance.title.getAssistance")}
      subtitle={t("assistance.subtitle.getAssistance")}
      mainPage={true}
      sidebarContent={<ContactSideBarBlock />}
    >
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.housingCouneslors")}</Heading>}
        subheader={t("assistance.subtitle.housingCouneslors")}
        background="none"
        icon={<Icon size="2xl" symbol={faPeopleGroup} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <RouterLink key="housing-counselors" className="button" to={getHousingCounselorsPath()}>
            {t("housingCounselor.findAHousingCounselor")}
          </RouterLink>,
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
          <RouterLink
            key="additional-resources"
            className="button w-3/4 md:w-auto"
            to={getAdditionalResourcesPath()}
          >
            {t("assistance.title.additionalHousingOpportunities.button")}
          </RouterLink>,
        ]}
      />
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.sfServices")}</Heading>}
        subheader={t("assistance.subtitle.sfServices")}
        background="none"
        icon={<Icon size="2xl" symbol={faDoorOpen} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <LinkButton
            key="sf-services"
            className="button"
            href="https://sfserviceguide.org/"
            newTab
          >
            {t("assistance.title.sfServices.button")}
          </LinkButton>,
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
          <RouterLink key="document-checklist" className="button" to={getDocumentChecklistPath()}>
            {t("label.viewDocumentChecklist")}
          </RouterLink>,
        ]}
      />
      <ActionBlock
        header={<Heading priority={2}>{t("assistance.title.dahliaVideos")}</Heading>}
        subheader={t("assistance.subtitle.dahliaVideos")}
        background="none"
        icon={<Icon size="2xl" symbol={faYoutube} fill={bloomTheme.theme.colors.gray["750"]} />}
        actions={[
          <LinkButton
            key="dahlia-videos"
            className="button"
            href="https://www.youtube.com/playlist?list=PL7dcWHJTcA51TBqhghJ9LfSGEGoFB7aWG"
            newTab
          >
            {t("assistance.title.dahliaVideos.button")}
          </LinkButton>,
        ]}
      />
    </HeaderSidebarLayout>
  )
}

export default withAppSetup(GetAssistance, { pageName: AppPages.GetAssistance })
