const { UserInputError, AuthenticationError, withFilter, ForbiddenError } = require('apollo-server');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.extend(utc);
const { Op } = require('sequelize');
// import User model (from ../models/user.js)
// なんでrequire('../models'なのかは謎)
const { Message, User, Reaction } = require('../../models');
// const { PubSub } = require('graphql-subscriptions');


module.exports = {
    Query: {
        getMessages: async (parent, { from }, { user }) => {
            console.log('getMessages from: ', from)
            console.log('getMessages user: ', user)
            
            try {
                if (!user) throw new AuthenticationError('UnAuthenticated')
                
                const otherUser = await User.findOne({
                    where: { username: from }
                })
                if (!otherUser) throw new UserInputError('User not found')

                const usernames = [user.username, otherUser.username]

                const messages = await Message.findAll({
                    where: {
                        from: { [Op.in]: usernames },
                        to: { [Op.in]: usernames },
                    },
                    order: [['createdAt', 'DESC']],
                    // include: [{ model: Reaction, as: 'reactions' }],
                })
                console.log('messages: ', messages)
                
                return messages

            } catch (err) {
                console.log('getMessages error', err)
                throw err
            }
        }
    },
    Mutation: {
        sendMessage: async (parent, { to, content }, { user, pubsub }) => {
            console.log('to, content, user: ', to, content, user)

            try {
                if (!user) throw new AuthenticationError('Unauthenticated')

                const recipient = await User.findOne({ where: { username: to } })
                console.log('recipient.username : ', recipient.username)


                if (!recipient) {
                    throw new UserInputError('User not found')
                } else if (recipient.username === user.username) {
                    throw new UserInputError('You cannot send a message to yourself')
                }

                if (content.trim() === '') {
                    throw new UserInputError('Message is empty')
                }

                const message = await Message.create({
                    from: user.username,
                    to,
                    content,
                    // createdAt: dayjs.tz().format(),
                    // createdAt: new Date().toISOString(),
                })

                pubsub.publish('NEW_MESSAGE', { newMessage: message })

                return message
            } catch (err) {
                console.log(err)
                throw err
            }
        },

        reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
            const reactions = ['❤️', '😄', '😯', '😢', '😡', '👍', '👎']
            try {
                // Validate reaction content
                if (!reactions.includes(content)) {
                    throw new UserInputError('Invalid reaction')
                }
                // Get user
                const username = user ? user.username : ''
                user = await User.findOne({ where: { username } })
                if (!user) throw new AuthenticationError('Unauthenticated')
                
                // Get message
                const message = await Message.findOne({ where: { uuid } })
                if (!message) throw new UserInputError('message not found')

                if (message.from !== user.username && message.to !== user.username) {
                    throw new ForbiddenError('Unauthorized')
                }

                let reaction = await Reaction.findOne({ where: { messageId: message.id, userId: user.id } })
                
                if (reaction) {
                    // reaction exists, update it
                    reaction.content = content
                    await reaction.save()
                } else {
                    // reaction doesn't exists, create it 
                    reaction = await Reaction.create({
                        messageId: message.id,
                        userId: user.id,
                        content,
                    })
                }

                pubsub.publish('NEW_REACTION', { newReaction: reaction })

                return reaction
            } catch (err) {
                throw err
            }
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                (_, __, { pubsub, user }) => {
                    if (!user) throw new AuthenticationError('Unauthenticated')
                    return pubsub.asyncIterator('NEW_MESSAGE')
                },
                ({ newMessage }, _, { user }) => {
                    if (
                        newMessage.from === user.username ||
                        newMessage.to === user.username
                    ) {
                        return true
                    }

                    return false
                }
            ),
        },
        newReaction: {
            subscribe: withFilter(
                (_, __, { pubsub, user }) => {
                    if (!user) throw new AuthenticationError('Unauthenticated')
                    return pubsub.asyncIterator('NEW_REACTION')
                },
                async ({ newReaction }, _, { user }) => {
                    const message = await newReaction.getMessage()
                    if (
                        message.from === user.username ||
                        message.to === user.username
                    ) {
                        return true
                    }

                    return false
                }
            ),
        },
    },
}