import React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>
type SectionProps = React.HTMLAttributes<HTMLElement>
type ListProps = React.HTMLAttributes<HTMLOListElement | HTMLUListElement>

const mergeClasses = (baseClass: string, className?: string) =>
  className ? `${baseClass} ${className}` : baseClass

export const InformationalContent = ({ className, children, ...props }: DivProps) => (
  <div className={mergeClasses("info-template-content", className)} {...props}>
    {children}
  </div>
)

export const InformationalSection = ({ className, children, ...props }: SectionProps) => (
  <section className={mergeClasses("info-template-section", className)} {...props}>
    {children}
  </section>
)

export const InformationalStack = ({ className, children, ...props }: DivProps) => (
  <div className={mergeClasses("info-template-stack", className)} {...props}>
    {children}
  </div>
)

export const InformationalDivider = ({ className, ...props }: DivProps) => (
  <div className={mergeClasses("info-template-divider", className)} {...props}>
    <hr />
  </div>
)

export const InformationalCallout = ({ className, children, ...props }: DivProps) => (
  <div className={mergeClasses("info-template-callout", className)} {...props}>
    {children}
  </div>
)

export const InformationalUnorderedList = ({ className, children, ...props }: ListProps) => (
  <ul
    className={mergeClasses("info-template-list info-template-list--unordered", className)}
    {...props}
  >
    {children}
  </ul>
)

export const InformationalOrderedList = ({ className, children, ...props }: ListProps) => (
  <ol
    className={mergeClasses("info-template-list info-template-list--ordered", className)}
    {...props}
  >
    {children}
  </ol>
)

export const InformationalHeaderGroup = ({ className, children, ...props }: DivProps) => (
  <div className={mergeClasses("info-template-header-group", className)} {...props}>
    {children}
  </div>
)
