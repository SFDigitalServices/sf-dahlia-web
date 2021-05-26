import React, { AnchorHTMLAttributes, DetailedHTMLProps } from "react"

type LinkProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>

/**
 * Right now this is a very simple link component, but we keep it in
 * its own file so that if we add functionality to it we can do it in one place only.
 */
const Link = ({ ...props }: LinkProps) => <a {...props}>{props.children}</a>

export default Link
