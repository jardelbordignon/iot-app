import { z } from 'zod'

const envSchema = z.object({
	ENV: z.enum(['development', 'test', 'production']),
	PORT: z.coerce.number(),
	MQTT_PORT: z.coerce.number(),
	TOPIC: z.string(),
})

export const env = envSchema.parse(process.env)
