import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { GetPoll } from './routes/GetPoll'
import { CreatePoll } from './routes/CreatePoll'
import { VoteOnPoll } from './routes/VoteOnPoll'

const app = fastify()

app.register(cookie, {
  hook: 'onRequest',
  secret: 'eaf4b5f07ac8392707bc16bf9fd10c6eb0597434',
})

app.register(GetPoll)
app.register(CreatePoll)
app.register(VoteOnPoll)

app
  .listen({ port: 3333 })
  .then(() => console.log('Server is running!'))