const bcrypt = require('bcryptjs');
const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env.json')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.extend(utc);
const { Op } = require('sequelize');

// import User model (from ../models/user.js)
// なんでrequire('../models'なのかは謎)
const { Message, User } = require('../../models');


module.exports = {
    Query: {
        // getUsers: (parent, args, context, info)
        getUsers: async (_, __, { user }) => {
            // ▲userにはqueryを投げたuser（認証済ユーザー）の情報が入る
            console.log('user: ', user)

            try {
                if (!user) throw new AuthenticationError('Unauthenticated')

                // ログイン後に自分の情報は取ってこないが他のユーザーの情報は取ってきたい
                // [Op.ne]は’Operators. not equal'の意味
                let users = await User.findAll({
                    attributes: ['username', 'imageUrl', 'createdAt'],
                    where: { username: { [Op.ne]: user.username } }
                })
                console.log('getUsers: ', users)
                

                const allUserMessages = await Message.findAll({
                    where: {
                        [Op.or]: [{from: user.username}, {to: user.username}]
                    },
                    order: [['createdAt', 'DESC']]
                })

                users = users.map(otherUser => {
                    const latestMessage = allUserMessages.find(
                        m => m.from === otherUser.username || m.to === otherUser.username
                    )
                    otherUser.latestMessage = latestMessage
                    return otherUser
                })

                return users
            } catch (err) {
                console.log(err)
                throw err
            }
        },
        login: async (_, args) => {
            // args は loginクエリを投げる時に渡される引数（login(username: "john", password: "123456")）
            console.log('login args: ', args)
            
            const { username, password } = args
            let errors = {}

            try {
                if (username.trim() === '') {
                    errors.username = 'username must not be empty'
                }
                // passwordはスペース入っている可能性もあるからtrim()は付けない
                if (password === '') {
                    errors.password = 'password must not be empty'
                }
                if (Object.keys(errors).length > 0) {
                    throw new UserInputError('bad input', { errors })
                }
                const user = await User.findOne({
                    where: { username },
                })
                if (!user) {
                    errors.username = 'user not found'
                    throw new UserInputError('user not found', { errors })
                }

                // アカウントが存在していたらパスワードが登録されているものとマッチするか確認する
                // boolean
                // ハッシュ化したパスワードと比較
                const correctPassword = await bcrypt.compare(password, user.password)

                if (!correctPassword) {
                    errors.password = 'password is incorrect'
                    throw new UserInputError('password is incorrect', { errors })
                }
                // jwt の作成
                // JWT_SECRETが鍵
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: 60 * 60 });

                return {
                    ...user.toJSON(),
                    // createdAt: dayjs.tz().format(),
                    // createdAt: new Date().toISOString(),
                    token,
                }
            } catch (err) {
                console.log(err)
                throw err
            }
        }
    },
    Mutation: {
        // resolverは4つのパラメータを受け取る
        // parent: 他のresolverから渡される値（今回はトップレベルだから何もない）
        // args: resolverに渡される引数（username: String!, email: String!, password: String!, confirmPassword: String!）
        // context: 全てのresolversで共通して使用されるデータ（今回はauthentication情報）
        // info: 
        // register: async (parent, args, context, info) => {}
        register: async (_, args) => {
            console.log('args: ', args)

            let { username, email, password, confirmPassword } = args
            let errors = {}

            try {
                // TODO: Validate input data（空のcredentialsで登録できないようにする）
                if (email.trim() === '') {
                    errors.email = 'email must not be empty'
                }
                if (username.trim() === '') {
                    errors.username = 'username must not be empty'
                }
                if (password.trim() === '') {
                    errors.password = 'password must not be empty'
                }

                if (confirmPassword.trim() === '') {
                    errors.confirmPassword = 'repeat password must not be empty'
                }

                if (password !== confirmPassword) {
                    errors.confirmPassword = 'passwords must much'
                }
                // // TODO: Check if username / email exists（重複を防ぐ）=> DBからfetchする
                // // whereはデフォルト
                // // { username }は{ username: username }の省略記法
                // const userByUsername = await User.findOne({where: { username }})
                // const userByEmail = await User.findOne({ where: { email } })

                // if (userByUsername) {
                //     errors.username = 'Username is taken'
                // } 
                // if (userByEmail) {
                //     errors.email = 'Email is taken'
                // } 

                if (Object.keys(errors).length > 0) {
                    throw errors
                }

                // Hash password
                password = await bcrypt.hash(password, 6)

                // Create user
                const user = await User.create({
                    // username: usernameの省略記法
                    username,
                    email,
                    password
                })

                // TODO: Return user
                // sequelizeを使うときはreturnすると自動的にJSONオブジェクトになるからreturn user.toJSON()とする必要はない
                return user
            } catch (err) {
                console.log('err.name: ', err.name)
                console.log('err.errors: ', err.errors)
                if (err.name === 'SequelizeUniqueConstraintError') {
                    err.errors.forEach(
                        (e) => (errors[e.path] = `${e.path} is already taken`),
                    )
                    err.errors.forEach(
                        (e) => (console.log('split: ', errors[e.path].split('users.')[1])),
                    )
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach((e) => (errors[e.path] = e.message))
                } throw new UserInputError('Bad input', { errors })

                // GraphQLエラーレスポンスとしてerrを返す（投げる）

                // ▼だとextensionsにerrorsが入らない（＝client側からerrorsにアクセスできない）
                // throw new UserInputError('Bad input', err)
                // ▼改善策
                // throw new UserInputError('Bad input', { errors: err })

                // ▼ sequelize(?)が返してくれるエラーをそのまま利用する場合
                throw new UserInputError('Bad input', { errors })
            }
        },
    }
}