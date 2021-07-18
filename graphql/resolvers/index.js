const userResolvers = require('./users')
const messageResolvers = require('./messages')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.extend(utc);

module.exports = {
    Message: {
        // createdAt: (parent) => {
        //     dayjs.tz().format()
        //     console.log('Message createdAt: ', dayjs.tz().format())
        // }
        
        createdAt: (parent) => {
            parent.createdAt.toISOString()
            console.log('message parent createdAt.toISOString(): ', parent.createdAt.toISOString())
        }
        // createdAt: (parent) => {
        //     parent.createdAt
        //     console.log('message parent createdAt: ', parent.createdAt)
        // }
    },
    User: {
        createdAt: () => dayjs.tz().format()
        // createdAt: (parent) => parent.createdAt.toISOString()

        // createdAt: (parent) => {
        //     parent.createdAt.toISOString().tz().format()
        //     console.log(parent.createdAt)
        // }
    },
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...messageResolvers.Mutation,
    },
    Subscription: {
        ...messageResolvers.Subscription,
    },
}