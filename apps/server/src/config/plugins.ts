import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

export function plugins(app: FastifyInstance) {
	app.register(cors, {
		origin: true,
	})
}
