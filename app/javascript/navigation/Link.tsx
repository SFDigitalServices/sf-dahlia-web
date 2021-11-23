import React, { AnchorHTMLAttributes, DetailedHTMLProps } from "react"
import { localizedPath } from "../util/routeUtil"

type LinkProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
  external?: boolean
}

/**
 * Right now this is a very simple link component, but we keep it in
 * its own file so that if we add functionality to it we can do it in one place only.
 */
const Link = ({ ...props }: LinkProps) => {
  const link = props.external ? props.href : localizedPath(props.href)
  return (
    <a {...props} href={link}>
      {props.children}
    </a>
  )
}

export default Link
