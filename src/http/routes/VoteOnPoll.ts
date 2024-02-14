import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'

export async function VoteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollParams = z.object({ pollId: z.string().uuid() })
    const voteOnPollBody = z.object({ pollOptionId: z.string().uuid() })

    const { pollId } = voteOnPollParams.parse(request.params)
    const { pollOptionId } = voteOnPollBody.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            pollId,
            sessionId,
          }
        }
      })

      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
        await prisma.vote.delete({
          where: { id: userPreviousVoteOnPoll.id }
        })

        await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId)
      }

      if (userPreviousVoteOnPoll?.pollOptionId === pollOptionId) {
        return reply
          .status(400)
          .send({ message: 'You have already voted on this poll' })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        signed: true,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      }
    })

    await redis.zincrby(pollId, 1, pollOptionId)

    return reply
      .status(201)
      .send()
  })
}