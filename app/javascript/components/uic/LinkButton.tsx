// Vendored from @bloom-housing/ui-components src/actions/LinkButton.tsx
import React, { useContext } from "react"
import "./Button.scss"
import { buttonClassesForProps, buttonInner, ButtonProps } from "./Button"
import { NavigationContext } from "./NavigationContext"
import { isExternalLink } from "./links"
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "./Icon"

export interface LinkButtonProps extends Omit<ButtonProps, "onClick"> {
  href: string
  dataTestId?: string
  newTab?: boolean
  newTabIcon?: boolean
}

const LinkButton = (props: LinkButtonProps) => {
  const { LinkComponent } = useContext(NavigationContext)
  const buttonClasses = buttonClassesForProps(props)

  return isExternalLink(props.href) ? (
      <a
        href={props.href}
        className={buttonClasses.join(" ")}
        data-testid={props.dataTestId}
        target={props.newTab ? "_blank" : "_self"}
      >
        {buttonInner(props)}
        {props.newTabIcon && (
          <>
            <Icon symbol={faUpRightFromSquare} size={"small"} className={"ml-2"} />
            <span className="sr-only">{"Opens in a new tab"}</span>
          </>
        )}
      </a>
    ) : (
      <LinkComponent
        href={props.href}
        aria-hidden={props.ariaHidden}
        tabIndex={props.ariaHidden ? -1 : 0}
        className={buttonClasses.join(" ")}
        data-testid={props.dataTestId}
      >
        {buttonInner(props)}
      </LinkComponent>
    )
}

export { LinkButton as default, LinkButton }
