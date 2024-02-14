import { z } from "zod"
import { FastifyInstance } from "fastify"
import { voting } from "../pub-sub/VotingPubSub"


export async function PollResults(app: FastifyInstance) {
  app.get('/polls/:pollId/results', { websocket: true }, (connection, request) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    })

    const { pollId } = getPollParams.parse(request.params)

    voting.sub(pollId, (message) => {
      connection.socket.send(JSON.stringify(message))
    })
  })
}