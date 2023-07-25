import React from "react"

export default function WhatToExpect({ step, setStep }) {
  const handleClick = () => {
    setStep(step + 1)
  }

  return (
    <div>
      <h1>Here's what to expect for this application.</h1>
      <hr />
      <p style={{ padding: ".5em" }}>
        First we'll ask about you and the people you plan to live with. Then, we'll ask about your
        income. Finally, we'll see if you qualify for any affordable housing lottery preference, and
        if so, ask you to upload proof of those preferences.
      </p>
      <p style={{ padding: ".5em" }}>
        See our checklist for information about required documents and claiming preferences.
      </p>
      <p style={{ padding: ".5em" }}>
        You may also start the application now and save it and upload documents later.
      </p>
      <p style={{ padding: ".5em" }}>
        Please be aware that each household member can only appear on one application for each
        listing. If your application contains household members that are on other applications for
        this listing, all of them will be disqualified.
      </p>
      <p style={{ padding: ".5em" }}>
        Any fraudulent statements will cause your application to be removed from the lottery.
      </p>
      <div style={{ display: "flex", justifyContent: "center", padding: ".5em" }}>
        <button style={{ border: "solid", padding: ".5em" }} onClick={handleClick}>
          Next
        </button>
      </div>
    </div>
  )
}
