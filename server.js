const { ApolloServer } = require('apollo-server');
// import db instance (lower case)
// { sequelize } は db.sequelizeをさす（models/index.js 34行目）
const { sequelize } = require('./models');

// The GraphQL schema
// kind of routes
const typeDefs = require('./graphql/typeDefs');

// A map of functions which return data for the schema.
// kind of handlers
// hello という query（命令）に対して 'world' という文字列を返す
const resolvers = require('./graphql/resolvers');

// create ApolloServer instance
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);

    // connect to database after running server
    sequelize.authenticate()
        .then(() => console.log('Database connected!!'))
        .catch(err => console.log(err))
});
