import React from "react"

export default function ReservedQuestion({ step, setStep, reservedQuestion }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    setStep(step + 1)
  }

  return (
    <div>
      <h1>{reservedQuestion}</h1>
      <hr />
      <form>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "1em" }}
        >
          <div style={{ margin: ".5em" }}>
            <input type="radio" id="yes" name="reservedQuestion" value="Yes" />{" "}
            <label htmlFor="yes">Yes</label>
          </div>
          <div style={{ margin: ".5em" }}>
            <input type="radio" id="no" name="reservedQuestion" value="No" />{" "}
            <label htmlFor="no">No</label>
          </div>
          <div style={{ margin: ".5em" }}>
            <input
              style={{ border: "solid", padding: ".5em" }}
              type="submit"
              value="Next"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
