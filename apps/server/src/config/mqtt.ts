import { createServer } from 'node:net'
import { Aedes } from 'aedes'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from './env'

declare module 'fastify' {
	interface FastifyInstance {
		mqtt: Aedes
	}
}

const mqttPlugin = async (app: FastifyInstance) => {
	const broker = new Aedes()

	await broker.listen()

	broker.on('client', (client) => {
		console.log(`Client connected: ${client.id}`)
	})

	broker.on('clientError', (client, error) => {
		console.error('MQTT Client Error:', client?.id, error)
	})

	broker.on('connectionError', (client, error) => {
		console.error('MQTT Connection Error:', client?.id, error)
	})

	broker.on('clientDisconnect', (client) => {
		console.log(`Client disconnected: ${client.id}`)
	})

	broker.on('subscribe', (subscriptions, client) => {
		console.log('MQTT Subscribe:', client?.id, subscriptions)
	})

	broker.on('publish', (packet, client) => {
    // o heartbeat publica a cada 1 minuto em`$SYS/{this.id}/heartbeat`, não é necessário imprimir no console
    if (packet.topic.startsWith('$SYS')) {
      return
    }
      
    console.log('[MQTT PUBLISH]', {
      clientId: client?.id ?? 'BROKER/INTERNO',
      topic: packet.topic,
      payload: packet.payload.toString(),
    })
	})

	// Servidor TCP que delega tudo para o Aedes
	const server = createServer(broker.handle)

	// Inicia o servidor TCP na porta configurada
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(env.MQTT_PORT, () => {
			console.log(`Broker MQTT running on port ${env.MQTT_PORT}`)
			resolve()
		})
	})

	// Disponibiliza o broker em `app.mqtt` para toda a aplicação
	app.decorate('mqtt', broker)

	// Encerra o broker e o servidor TCP junto com o Fastify
	app.addHook('onClose', async () => {
		await new Promise<void>((resolve) => {
			broker.close(() => {
				server.close(() => resolve())
			})
		})
	})
}

export const mqtt = fp(mqttPlugin, { name: 'mqtt-broker' })
