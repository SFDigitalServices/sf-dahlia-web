import React, { AnchorHTMLAttributes, DetailedHTMLProps } from "react"
import { localizedPath } from "../util/routeUtil"

type LinkProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
  external?: boolean
  target?: string
}

/**
 * Right now this is a very simple link component, but we keep it in
 * its own file so that if we add functionality to it we can do it in one place only.
 */
const Link = ({ external = false, ...props }: LinkProps) => {
  const link = external ? props.href : localizedPath(props.href)
  const linkTarget = props.target || "_self"
  return (
    <a {...props} href={link} target={linkTarget}>
      {props.children}
    </a>
  )
}

export default Link
