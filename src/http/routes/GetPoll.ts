import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"

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

    const pollOptions = poll.options.map((option) => ({
      id: option.id,
      title: option.title,
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