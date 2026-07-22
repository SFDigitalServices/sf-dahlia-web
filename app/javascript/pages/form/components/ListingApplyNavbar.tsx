// ported and tweaked from https://github.com/bloom-housing/ui-components/blob/main/src/navigation/ProgressNav.tsx

import React from "react"
import styles from "./ListingApplyNavbar.module.scss"
import { t } from "@bloom-housing/ui-components"
import { type SectionInfo } from "../../../formEngine/formEngine"

const NavItem = ({
  sectionComplete,
  currentSection,
  label,
}: {
  sectionComplete: boolean
  currentSection: boolean
  label: string
}) => {
  let bgColor = styles["is-disabled"]
  if (currentSection) {
    bgColor = styles["is-active"]
  } else if (sectionComplete) {
    bgColor = styles["is-complete"]
  }

  // TODO WIP: use button and/or onClick event, get onClick handler has prop

  return (
    <li className={`${styles["progress-nav-item"]} ${bgColor}`}>
      <span
        aria-disabled={bgColor === styles["is-disabled"]}
        aria-current={bgColor === styles["is-active"]}
        className={styles["progress-nav-item-text"]}
      >
        {t(label)}
      </span>
    </li>
  )
}

const ListingApplyNavBar = ({
  sectionMap,
  completedSections,
  currentSectionName,
}: {
  sectionMap: SectionInfo[]
  completedSections: Record<string, boolean>
  currentSectionName: string
}) => {
  const currentSectionIdx = sectionMap.findIndex((section) => section.name === currentSectionName)
  const currentSectionIncomplete = !completedSections[currentSectionName]
  const isSectionComplete = (sectionToRender: SectionInfo, idx: number): boolean => {
    if (!completedSections[sectionToRender.name]) return false

    // if the current section is incomplete, all subsequent sections are marked as incomplete
    if (currentSectionIncomplete && currentSectionIdx < idx) return false

    return true
  }

  return (
    <div aria-label={"progress"}>
      <ol className={styles["progress-nav"]}>
        {sectionMap.map((section, idx) => (
          <NavItem
            key={section.name}
            sectionComplete={isSectionComplete(section, idx)}
            currentSection={currentSectionName === section.name}
            label={section.name}
          />
        ))}
      </ol>
    </div>
  )
}

export default ListingApplyNavBar
