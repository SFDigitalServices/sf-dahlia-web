import React from "react"

import Spinner from "./Spinner"

interface LoadingProps {
  children: React.ReactNode
  isLoading: boolean
}

const Loading = ({ children, isLoading = false }: LoadingProps) => {
  return (
    <div className={"loading-panel" + (isLoading ? " loading" : "")} data-testid="loading">
      {isLoading ? <Spinner /> : children}
    </div>
  )
}

export default Loading
