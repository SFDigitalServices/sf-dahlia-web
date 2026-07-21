import React, { useEffect, useState } from "react"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { Icon, UniversalIconType } from "@bloom-housing/ui-components"
import { DOBFieldValues } from "../pages/account/components/DOBFieldset"
import sharedStyles from "../pages/account/shared-styles.module.scss"

// We will strictly validate the email address using the following regex.
// Devise will also validate the email address on the backend with a looser pattern.
export const emailRegex = new RegExp(
  [
    "[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+)*",
    "@",
    "(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?",
  ].join("")
)

interface FormHeaderProps {
  title: string
  description: string
  className?: string
  iconSymbol?: UniversalIconType
}

export const FormHeader = ({
  title,
  description,
  className,
  iconSymbol = "profile",
}: FormHeaderProps) => {
  const classNames = [sharedStyles.header]
  if (className) {
    classNames.push(className)
  }

  return (
    <Card.Header divider="flush" className={classNames.join(" ")}>
      <div className={sharedStyles.iconBackground}>
        <Icon size="xlarge" className="md:hidden block" symbol={iconSymbol} />
        <Icon size="2xl" className="md:block hidden" symbol={iconSymbol} />
      </div>
      <Heading priority={1} size="2xl" className={sharedStyles.heading}>
        {title}
      </Heading>
      <p className="field-note text-base">{description}</p>
    </Card.Header>
  )
}

const MOBILE_SIZE = 768

export const FormSection = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card.Section className={className} divider={windowWidth > MOBILE_SIZE ? "inset" : "flush"}>
      {children}
    </Card.Section>
  )
}

export const getDobStringFromDobObject = (dobObject: DOBFieldValues) => {
  const date = new Date(
    Number.parseInt(dobObject.birthYear),
    Number.parseInt(dobObject.birthMonth) - 1,
    Number.parseInt(dobObject.birthDay)
  )
  return date.toISOString().split("T")[0]
}
