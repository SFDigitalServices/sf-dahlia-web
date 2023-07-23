import React from "react";

export default function ReservedQuestion({step, setStep, reservedQuestion}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(step + 1)
    }

    return (
        <div>
            <h1>{reservedQuestion}</h1>
            <hr/>
            <form>
                <input type="submit" value="Next" onClick={handleSubmit} />
            </form>
        </div>
    )
}
