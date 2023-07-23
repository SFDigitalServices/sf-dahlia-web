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
        <input type="radio" id="yes" name="fav_language" value="Yes" />{" "}
        <label htmlFor="yes">Yes</label>
        <br />
        <input type="radio" id="no" name="fav_language" value="No" /> <label htmlFor="no">No</label>
        <br />
        <input type="submit" value="Next" onClick={handleSubmit} />
      </form>
    </div>
  )
}
