import React from "react"

interface NameProps {
}

const Name = ({  }: NameProps) => {

  return (
      <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
        <p>Name Component</p>
      </div>
  )
}

export default Name
