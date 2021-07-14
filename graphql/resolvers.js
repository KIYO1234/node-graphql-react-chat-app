// import User model (from ../models/user.js)
// なんでrequire('../models'なのかは謎)
const { User } = require('../models');

module.exports = {
    Query: {
        getUsers: async () => {
            try {
                const users = await User.findAll()
                return users
            } catch (err) {
                console.log(err)
            }
        }
    },
    Mutation: {
        // resolverは4つのパラメータを受け取る
        // parent: 他のresolverから渡される値（今回はトップレベルだから何もない）
        // args: resolverに渡される引数（username: String!, email: String!, password: String!, confirmPassword: String!）
        // context , info => 
        // register: async (parent, args, context, info) => {}
        register: async (parent, args) => {
            const { username, email, password, confirmPassword } = args

            try {
                // TODO: Validate input data

                // TODO: Check if username / email exists

                // TODO: Create user
                await User.create({
                    // username: usernameの省略記法
                    username,
                    email,
                    password
                })

                // TODO: Return user
            } catch (err) {
                console.log(err)
                // GraphQLエラーレスポンスとしてerrを返す（投げる）
                throw err
            }
        }
    }
}