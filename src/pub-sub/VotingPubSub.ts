type Message = { 
  pollOptionId: string, 
  votes: number 
}

type Subscriber = (message: Message) => void

class VotingPubSub {
  private channels: Record<string, Subscriber[]> = {}

  sub(pollId: string, subscriber: Subscriber) {
    if (!this.channels[pollId]) this.channels[pollId] = []
    this.channels[pollId].push(subscriber)
  }

  pub(pollId: string, message: Message) {
    if (!this.channels[pollId]) return
    this.channels[pollId].forEach((subscriber) => subscriber(message))
  }
}

const voting = new VotingPubSub()

export { voting }
