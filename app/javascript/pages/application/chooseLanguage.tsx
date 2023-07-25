import React from "react"

export default function ChooseLanguage({ step, setStep }) {
  const handleClick = () => {
    setStep(step + 1)
  }

  return (
    <div>
      <h1>CHOOSE YOUR LANGUAGE</h1>
      <br />
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <button style={{ border: "solid", padding: "1em" }} onClick={handleClick}>
          BEGIN
        </button>
        <button style={{ border: "solid", padding: "1em" }} onClick={handleClick}>
          EMPEZAR
        </button>
        <button style={{ border: "solid", padding: "1em" }} onClick={handleClick}>
          開始
        </button>
        <button style={{ border: "solid", padding: "1em" }} onClick={handleClick}>
          Magsimula
        </button>
      </div>
    </div>
  )
}
