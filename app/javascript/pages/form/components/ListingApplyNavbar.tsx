// ported and tweaked from https://github.com/bloom-housing/ui-components/blob/main/src/navigation/ProgressNav.tsx

import React from "react"
import styles from "./ListingApplyNavbar.module.scss"
import { t } from "@bloom-housing/ui-components"

const NavItem = (props: {
  section: number
  sectionComplete: boolean
  currentPageSection: number
  label: string
  strings?: {
    screenReaderCompleted?: string
    screenReaderNotCompleted?: string
    screenReaderTitle?: string
  }
}) => {
  let bgColor = styles["is-disabled"]
  if (props.section === props.currentPageSection) {
    bgColor = styles["is-active"]
  } else if (props.sectionComplete) {
    bgColor = styles["is-complete"]
  }

  const srTextBuilder = (): string | React.ReactNode => {
    if (props.section < props.currentPageSection) {
      return (
        // Add translations strings from bloom
        <span className="sr-only">
          {props.strings?.screenReaderCompleted ?? t("progressNav.completed")}
        </span>
      )
    } else if (props.section > props.currentPageSection) {
      return (
        <span className="sr-only">
          {props.strings?.screenReaderNotCompleted ?? t("progressNav.notCompleted")}
        </span>
      )
    } else {
      return ""
    }
  }

  return (
    <li className={`${styles["progress-nav-item"]} ${bgColor}`}>
      <span
        aria-disabled={bgColor === styles["is-disabled"]}
        aria-current={bgColor === styles["is-active"]}
        className={styles["progress-nav-item-text"]}
      >
        {t(props.label)} {srTextBuilder()}
      </span>
    </li>
  )
}

const ListingApplyNavBar = (props: {
  currentPageSection: number
  completedSections: string[]
  removeSrHeader?: boolean
  labels: string[]
  strings?: {
    screenReaderHeading?: string
  }
}) => {
  return (
    <div aria-label={"progress"}>
      {!props.removeSrHeader && (
        <h2 className="sr-only">
          {props.strings?.screenReaderHeading ?? t("progressNav.srHeading")}
        </h2>
      )}
      <ol className={styles["progress-nav"]}>
        {props.labels.map((label, i) => (
          <NavItem
            key={label}
            section={i + 1}
            sectionComplete={props.completedSections.includes(label)}
            currentPageSection={props.currentPageSection}
            label={label}
          />
        ))}
      </ol>
    </div>
  )
}

export default ListingApplyNavBar
