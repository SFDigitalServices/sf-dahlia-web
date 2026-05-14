import { emailRegex } from "./accountUtil"

export const isValidEmail = (email: string) => {
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string) => {
  return phone.length === 10 && !Number.isNaN(Number(phone))
}
