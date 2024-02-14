import fastify from 'fastify'
import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'

import { GetPoll } from './routes/GetPoll'
import { CreatePoll } from './routes/CreatePoll'
import { VoteOnPoll } from './routes/VoteOnPoll'
import { PollResults } from '../ws/PollResults'

const app = fastify()

app.register(websocket)
app.register(cookie, {
  hook: 'onRequest',
  secret: 'eaf4b5f07ac8392707bc16bf9fd10c6eb0597434',
})

app.register(GetPoll)
app.register(CreatePoll)
app.register(VoteOnPoll)
app.register(PollResults)

app
  .listen({ port: 3333 })
  .then(() => console.log('Server is running!'))