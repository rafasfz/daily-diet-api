import { z } from 'zod'

// [POST] /users
export const createUserBodySchema = z.object({
  username: z.string(),
  email: z.string().email(),
})
