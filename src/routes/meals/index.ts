import { FastifyInstance } from 'fastify'
import { createMealBodySchema } from './schemas'
import { randomUUID } from 'node:crypto'
import { knex } from '../../database'
import { checkSessionIdExists } from '../../middlewares/checkSessionIdExistis'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies

    if (!sessionId) {
      return reply.status(401).send({ message: 'User not authenticated' })
    }

    const mealData = {
      id: randomUUID(),
      ...createMealBodySchema.parse(request.body),
      user_id: sessionId,
    }

    await knex('meals').insert(mealData)

    return reply.status(201).send()
  })
}
