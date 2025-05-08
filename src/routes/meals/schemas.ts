import { z } from 'zod'

// [POST] /meals
export const createMealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  datetime: z.string().datetime(),
  is_on_diet: z.boolean(),
})

export const updateMealBodySchema = createMealBodySchema.partial()
