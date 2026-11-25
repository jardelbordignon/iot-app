import type { FastifyInstance } from 'fastify'
import { env } from './config/env'

export function routes(app: FastifyInstance) {
	app.post<{ Body: { message: string } }>('/send', (req, reply) => {
		const { message } = req.body

		if (!message) {
			reply.code(400).send({ error: 'Message is required' })
			return
		}

		app.mqtt.publish(
			{
				topic: env.TOPIC,
				qos: 0,
				cmd: 'publish',
				dup: false,
				retain: false,
				payload: message,
			},
			(err) => {
				if (err) {
					req.log.error(err)
				}
			},
		)
		reply.code(200).send({ message: 'Message sent successfully' })
	})

  app.post<{ Body: { email: string; pass: string } }>('/echo', (req, reply) => {
    const { email, pass } = req.body
    reply.code(200).send({ email, pass })
  })
}
