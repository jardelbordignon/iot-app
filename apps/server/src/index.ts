import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '@/config/env'
import { mqtt } from './config/mqtt'
import { plugins } from './config/plugins'
import { routes } from './routes'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

plugins(app)

app.register(mqtt)

app.register(routes)

app.listen(
	{
		host: '0.0.0.0',
		port: env.PORT,
	},
	(err, address) => {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		console.log(`Server listening at ${address}`)
	},
)
