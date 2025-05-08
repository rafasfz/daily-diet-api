// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Users {
    transactions: {
      id: string
      username: string
      email: number
    }
  }
  export interface Meals {
    id: string
    name: string
    description: string
    datetime: string
    is_on_diet: boolean
    user_id: string
  }
}
