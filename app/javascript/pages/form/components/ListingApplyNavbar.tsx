// ported and tweaked from https://github.com/bloom-housing/ui-components/blob/main/src/navigation/ProgressNav.tsx

import React from "react"
import styles from "./ListingApplyNavbar.module.scss"
import { t } from "@bloom-housing/ui-components"
import { type SectionInfo } from "../../../formEngine/formEngine"

const NavItem = ({
  sectionAccessible,
  currentSection,
  sectionName,
  onSectionClick,
}: {
  sectionAccessible: boolean
  currentSection: boolean
  sectionName: string
  onSectionClick: (sectionName: string) => void
}) => {
  const handleClick = () => {
    onSectionClick(sectionName)
  }

  if (currentSection)
    return (
      <li className={`${styles["progress-nav-item"]} ${styles["is-active"]}`}>
        <span
          aria-disabled={false}
          aria-current={true}
          className={styles["progress-nav-item-text"]}
        >
          {t(sectionName)}
        </span>
      </li>
    )

  if (sectionAccessible)
    return (
      <li className={`${styles["progress-nav-item"]} ${styles["is-accessible"]}`}>
        <button
          type="button"
          aria-disabled={false}
          aria-current={false}
          className={styles["progress-nav-item-text"]}
          onClick={handleClick}
        >
          {t(sectionName)}
        </button>
      </li>
    )

  return (
    <li className={`${styles["progress-nav-item"]} ${styles["is-disabled"]}`}>
      <span aria-disabled={true} aria-current={false} className={styles["progress-nav-item-text"]}>
        {t(sectionName)}
      </span>
    </li>
  )
}

const ListingApplyNavBar = ({
  sectionMap,
  completedSections,
  currentSectionName,
  jumpToStep,
}: {
  sectionMap: SectionInfo[]
  completedSections: Record<string, boolean>
  currentSectionName?: string
  jumpToStep: (stepSlug: string) => void
}) => {
  const currentSectionIdx = sectionMap.findIndex((section) => section.name === currentSectionName)
  const currentSectionIncomplete = currentSectionName && !completedSections[currentSectionName]
  const isSectionAccessible = (sectionName: string, idx: number): boolean => {
    // if all previous sections are complete, then a section is accessible regardless of its completion status
    if (idx > 0 && sectionMap.slice(0, idx).every((section) => completedSections[section.name]))
      return true

    if (!completedSections[sectionName]) return false

    // if the current section is incomplete, all subsequent sections are inaccessible, regardless of their completion status
    if (currentSectionIncomplete && currentSectionIdx < idx) return false

    return true
  }

  const handleSectionClick = (sectionName: string) => {
    const firstStepOfSection = sectionMap.find((section) => section.name === sectionName)
      ?.stepSlugs[0]
    if (!firstStepOfSection) return

    jumpToStep(firstStepOfSection)
  }

  return (
    <nav aria-label={"progress"}>
      <ol className={styles["progress-nav"]}>
        {sectionMap.map((section, idx) => (
          <NavItem
            key={section.name}
            sectionAccessible={isSectionAccessible(section.name, idx)}
            currentSection={currentSectionName === section.name}
            sectionName={section.name}
            onSectionClick={handleSectionClick}
          />
        ))}
      </ol>
    </nav>
  )
}

export default ListingApplyNavBar
