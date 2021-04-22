interface User {
  /**  */
  uid: string

  /**  */
  email: string

  /**  */
  created_at: Date

  /**  */
  updated_at: Date
}

interface UserData {
  data: User
  success: boolean
}

export { User, UserData }
