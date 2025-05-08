import { FastifyInstance } from 'fastify'
import { createUserBodySchema } from './schemas'
import { randomUUID } from 'node:crypto'
import { knex } from '../../database'
import { checkSessionIdExists } from '../../middlewares/checkSessionIdExistis'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    let { sessionId } = request.cookies

    if (sessionId) {
      return reply.status(400).send({ message: 'User already created' })
    }

    sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
    })

    const userId = sessionId

    const userData = {
      id: userId,
      ...createUserBodySchema.parse(request.body),
    }

    await knex('users').insert({
      ...userData,
    })

    return reply.status(201).send()
  })

  app.get(
    '/me',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .where('user_id', sessionId)
        .orderBy('datetime', 'desc')

      console.log('meals', meals)

      const mealsCount = meals.length
      const mealsOnDietCount = meals.filter((meal) => meal.is_on_diet).length
      const mealsOffDietCount = meals.filter((meal) => !meal.is_on_diet).length
      let mealCountBestSessionOnDiet = 0

      if (meals.length > 0) {
        let currentSessionOnDiet = 0

        meals.forEach((meal) => {
          if (meal.is_on_diet) {
            currentSessionOnDiet++
          } else {
            currentSessionOnDiet = 0
          }

          if (currentSessionOnDiet > mealCountBestSessionOnDiet) {
            mealCountBestSessionOnDiet = currentSessionOnDiet
          }
        })
      }

      const user = await knex('users').where('id', sessionId).first()

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
        })
      }

      return reply.status(200).send({
        user: {
          ...user,
          meals_count: mealsCount,
          meals_on_diet_count: mealsOnDietCount,
          meals_off_diet_count: mealsOffDietCount,
          meal_count_best_session_on_diet: mealCountBestSessionOnDiet,
        },
      })
    },
  )
}
