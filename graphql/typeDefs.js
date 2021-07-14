const { gql } = require('apollo-server');

module.exports = gql`
  type User {
      # !は必須の印
      username: String!
      email: String!
  }
  type Query {
    getUsers: [User]!
  }
  type Mutation {
    # 引数の , はなくてもOK
    # 最後の :User はUserを返すという意味
    register(username: String!, email: String!, password: String!, confirmPassword: String!): User!
  }

`;