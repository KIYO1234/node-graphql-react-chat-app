const { gql } = require('apollo-server');

module.exports = gql`
  type User {
      # !は必須の印
      username: String!
      email: String
      createdAt: String
      token: String
      imageUrl: String
      latestMessage: Message
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String
    reactions: [Reaction]
  }
  type Reaction {
    uuid: String!
    content: String!
    createdAt: String!
    message: Message!
    user: User!
  }
  type Query {
    getUsers: [User]!
    login(
      username: String!
      password: String!
    ): User!
    getMessages(from: String!): [Message]!
  }
  type Mutation {
    # 引数の , はなくてもOK
    # 最後の :User はUse typeを返すという意味
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!

    sendMessage(
      to: String!
      content: String!
    ): Message!

    reactToMessage(uuid: String! content: String!): Reaction!
  }

  type Subscription {
    newMessage: Message!
    newReaction: Reaction!
  }

`;