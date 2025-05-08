import { FastifyInstance } from 'fastify'
import { createUserBodySchema } from './schemas'
import { randomUUID } from 'node:crypto'
import { knex } from '../../database'

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
}
