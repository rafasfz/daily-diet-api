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
}
