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
  sucess: string
}

export { User, UserData }
