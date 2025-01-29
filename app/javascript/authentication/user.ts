interface User {
  /**  */
  uid: string

  id: number

  /**  */
  email: string

  /**  */
  created_at: Date

  /**  */
  updated_at: Date

  firstName?: string

  middleName?: string

  lastName?: string

  dobObject?: {
    birthDay: string
    birthMonth: string
    birthYear: string
  }

  DOB?: string
}

interface UserData {
  data: User
  success: boolean
}

export { User, UserData }
