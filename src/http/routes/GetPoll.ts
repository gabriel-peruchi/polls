import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { redis } from "../../lib/redis"

export async function GetPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const getPollParams = z.object({ pollId: z.string().uuid() })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    if (!poll) {
      return reply
        .status(400)
        .send({ message: 'Poll not found.' })
    }

    const votesResult = await redis.zrange(pollId, 0, -1, 'WITHSCORES')
    
    const votesByPollOption = votesResult.reduce((obj, line, index) => {
      if (index % 2 !== 0) return obj
      const score = votesResult[index + 1]
      return Object.assign(obj, { [line]: Number(score) })
    }, {} as Record<string, number>)

    const pollOptions = poll.options.map((option) => ({
      id: option.id,
      title: option.title,
      score: votesByPollOption[option.id] ?? 0,
    }))

    return reply.send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: pollOptions
      },
    })
  })
}