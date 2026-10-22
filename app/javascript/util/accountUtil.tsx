import React from "react"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { Icon, UniversalIconType } from "@bloom-housing/ui-components"
import { DOBFieldValues } from "../pages/account/components/DOBFieldset"
import sharedStyles from "../pages/account/shared-styles.module.scss"
import { getAddPasswordPath, getReverificationPath, getUpdateEmailPath } from "./routeUtil"
import { AUTH_FLOW } from "../modules/constants"
import { createSearchParams, useNavigate } from "react-router"
import { useAuth } from "@clerk/react"

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
    <Card.Header divider="inset" className={classNames.join(" ")}>
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

export const FormSection = ({
  className,
  children,
  fullWidthDivider = false,
}: {
  className?: string
  children: React.ReactNode
  fullWidthDivider?: boolean
}) => {
  return (
    <Card.Section className={className} divider={fullWidthDivider ? "flush" : "inset"}>
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

export enum REVERIFICATION_FLOW {
  ADD_PASSWORD = "addPassword",
  UPDATE_LOGIN_EMAIL = "updateLoginEmail",
  UPDATE_CONTACT_EMAIL = "updateContactEmail",
}

export const isReverificationFlow = (value: string | null): value is REVERIFICATION_FLOW =>
  !!value && Object.values(REVERIFICATION_FLOW).includes(value as REVERIFICATION_FLOW)

export const reverificationDestinations: Record<
  REVERIFICATION_FLOW,
  { path: () => string; state?: Record<string, unknown> }
> = {
  [REVERIFICATION_FLOW.ADD_PASSWORD]: {
    path: getAddPasswordPath,
    state: { accountSettingsFlow: true },
  },
  [REVERIFICATION_FLOW.UPDATE_LOGIN_EMAIL]: {
    path: getUpdateEmailPath,
    state: { flow: AUTH_FLOW.UPDATE_LOGIN_EMAIL },
  },
  [REVERIFICATION_FLOW.UPDATE_CONTACT_EMAIL]: {
    path: getUpdateEmailPath,
    state: { flow: AUTH_FLOW.UPDATE_CONTACT_EMAIL },
  },
}

export const useReverificationNavigation = () => {
  const navigate = useNavigate()
  const { has } = useAuth()

  return (flow: REVERIFICATION_FLOW) => {
    const needsReverification = !has?.({ reverification: "strict" })
    const reverificationDestination = reverificationDestinations[flow]

    if (needsReverification) {
      void navigate({
        pathname: getReverificationPath(),
        search: createSearchParams({ flow }).toString(),
      })
      return
    }
    void navigate(reverificationDestination.path(), { state: reverificationDestination.state })
  }
}
