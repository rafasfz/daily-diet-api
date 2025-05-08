import { FastifyInstance } from 'fastify'
import { createMealBodySchema, updateMealBodySchema } from './schemas'
import { randomUUID } from 'node:crypto'
import { knex } from '../../database'
import { checkSessionIdExists } from '../../middlewares/checkSessionIdExistis'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const mealData = {
      id: randomUUID(),
      ...createMealBodySchema.parse(request.body),
      user_id: sessionId,
    }

    await knex('meals').insert(mealData)

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('user_id', sessionId).select('*')

    return reply.status(200).send({ meals })
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { sessionId } = request.cookies

    const meal = await knex('meals').where({ id, user_id: sessionId }).first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found',
      })
    }

    return reply.status(200).send({ meal })
  })

  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { sessionId } = request.cookies

    const mealData = updateMealBodySchema.parse(request.body)

    const meal = await knex('meals').where({ id, user_id: sessionId }).first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found',
      })
    }

    await knex('meals')
      .where({ id, user_id: sessionId })
      .update({
        ...meal,
        ...mealData,
      })

    return reply.status(200).send()
  })
}
