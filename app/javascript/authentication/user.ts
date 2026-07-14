interface Contact {
  email: string
  firstName?: string
  middleName?: string
  lastName?: string
  DOB?: string
  phone?: string
  phoneType?: string
  alternatePhone?: string
  alternatePhoneType?: string
  housingCounselingAgencyName?: string | null
  housingCounselingAgencyLastModified?: string | null
  housingCounselingAgencyId?: string | null
}

interface User extends Contact {
  uid: string
  id: number
  created_at: Date
  updated_at: Date
  dobObject?: {
    birthDay: string
    birthMonth: string
    birthYear: string
  }
}

interface UserData {
  data: User
  success: boolean
}

export { Contact, User, UserData }
