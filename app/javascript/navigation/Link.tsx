import React, { AnchorHTMLAttributes, DetailedHTMLProps } from "react"

import { match as matchPath } from "path-to-regexp"
import { NavigateFunction, RouteObject } from "react-router-dom"

type LinkProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
  target?: string
}

/**
 * Right now this is a very simple link component, but we keep it in
 * its own file so that if we add functionality to it we can do it in one place only.
 */
const Link =
  (routes: RouteObject[], navigate: NavigateFunction) =>
  ({ ...props }: LinkProps) => {
    const linkTarget = props.target || "_self"

    const updatedRoutes = routes.map((route) => {
      const updatedPath = route?.path?.replace(":lang", ":lang(en|es|zh|tl)")
      return { ...route, path: updatedPath }
    })

    const customNavigate = (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      link: string
    ) => {
      const isRegistered = updatedRoutes.some((route) => {
        const match = matchPath(route.path)
        return match(link)
      })

      console.log(link, isRegistered)

      if (isRegistered) {
        event.preventDefault()
        navigate(link)
      } else {
        console.log(link)
        window.location.href = link
      }
    }

    return (
      <a
        href={props.href}
        target={linkTarget}
        onClick={(event) => customNavigate(event, props.href)}
        {...props}
      >
        {props.children}
      </a>
    )
  }

export default Link
