import fastify from 'fastify'

import { CreatePoll } from './routes/CreatePoll'

const app = fastify()

app.register(CreatePoll)

app
  .listen({ port: 3333 })
  .then(() => console.log('Server is running!'))