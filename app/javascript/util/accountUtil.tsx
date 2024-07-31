// We will strictly validate the email address using the following regex.
// Devise will also validate the email address on the backend with a looser pattern.
export const emailRegex = new RegExp(
  [
    "[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+)*",
    "@",
    "(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?",
  ].join("")
)
