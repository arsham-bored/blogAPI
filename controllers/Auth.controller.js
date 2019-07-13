const User = require('./User.control')
const { create } = User

const { verify, sign } = require('./Token.controller')
const secret_plan = require('../config.json').secret

const { hash, compare } = require('./Crypto.controller')
const UserModel = require('../models/User.model')

/**
 * All stuff that gonna happen in API for authiacation
 */
class Auth {

    /**
     * sign-up controller for `auth/signup`
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async SignUp(req, res, next) {

        const path = req.file != undefined ? req.file.path : undefined
        let { body } = req

        if (body.name == undefined) res.json({
            status: 209,
            mssg: '`name` is required'
        })

        let CheckForNewUserName = await User.CheckUserByUserName(body.UserName)
        console.log(CheckForNewUserName)
        let bioHasHighLength = (`${body.bio}`.length > 60)
        let img = path != undefined ? path : 'data/0bde3c4954adba6c2b2508e9fd4f6ba4'
        if (bioHasHighLength) res.status(208).json({ bio: 'warn, max-length: 60' })
        if (CheckForNewUserName != null) res.status(209).json({
            singup: false,
            mssg: 'UserName already in use'
        })
        if (body.password == undefined) res.status(209).json({
            singup: false,
            mssg: 'password is missing'
        })

        else {
            const creation = await create({
                name: body.name,
                UserName: body.UserName,
                bio: body.bio,
                profile: `${img}`,
                password: await hash(body.password)
            })

            const data = await creation
            req.user = data

            const new_data_form = {
                name: data.name,
                password: body.password,
                UserName: data.UserName,
                bio: data.bio,
                profile: data.profile,
                _id: `${data._id}`
            }
            try {
                const token = await sign(new_data_form)
                res.status(206)
                res.json({ TOKEN: token })
            }
            catch (err) {
                res.status(503)
                res.json({ err: 'server inner error' })
            }


        }
    }

    /**
     * validator to check if user already logged or not
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async ValidateUserToken(req, res, next) {
        const { body } = req
        const token = body.TOKEN
        const secret = secret_plan // imported from config.json

        if (token == undefined) res.json({
            process: false,
            mssg: 'token is missing'
        })
        const ver = await verify(token, secret)
        req.token = ver
        console.log(ver)
        next()

    }

    /**
     * this middleware should run after TokeValidation middleware, this token will 
     * fail the process if token validation failed 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async ValidBlock(req, res, next) {
        const { UserName, password } = req.body
        if( UserName == undefined || password == undefined ) res.status(404).json({
            process: false,
            mssg: "user name or user password is missing"
        })

        const SearchForUser = await UserModel.findOne({UserName: UserName})
        if(SearchForUser == null) res.status(404).json({
            process: false,
            mssg: "user not found"
        })

        const ValidatePassword = await compare(password, SearchForUser.password)
        console.log(ValidatePassword)
        if(ValidatePassword) next()
        else res.status(306).json({
            process: false,
            mssg: "user password does not match"
        })
    }

    /**
     * Login System. if validated, it gives you new TOKEN
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

    /**
     * LoginForm middleware, looking for (UserName and password) in req.boy
     * if exist and were true, this will givec client new TOKEN
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async LoginCheck(req, res, next) {
        const { id, password } = req.body

        if(id == undefined || password == undefined) res.status(404).json({
            process: false,
            mssg: "user ID or user password is missing"
        })

        try {
            const UserCheck = await UserModel.findById(id)
            if (UserCheck == null) res.json({
                exist: false,
                mssg: 'User does not exist'
            })

            else {
                const real_password = UserCheck.password
                const result = await compare(password, real_password)
                if (result) {
                    let data = {
                        name: UserCheck.name,
                        UserName: UserCheck.UserName,
                        password: password,
                        _id: `${UserCheck._id}`
                    }
                    const new_token = await sign(data)
                    res.status(206).json({
                        login: true,
                        TOKEN: new_token
                    })
                }

                else res.status(306).json({
                    process: false,
                    mssg: "password does not match"
                })

            }
        }
        catch(err) {
            res.status(503).json(err)
        }
    }

    /**
     * Looking for (UserName) and (password) in req.body for security reason, 
     * if there wasn't, this will refuse to run next middleware
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async LoginBlock(req, res, next) {
        const { token } = req

        if (token == undefined) res.status(306).json({
            process: false,
            mssg: "token is missing"
        })

        console.log({1: token})
        const {UserName, password} = token

        
        if (UserName == undefined || password == undefined) res.status(208).json({
            process: false,
            mssg: "`Username` or `password` is missing"
        })


        const CheckUser = await UserModel.findOne({UserName: UserName})
        if (CheckUser == null) {
            res.status(208).json({
                process: false,
                mssg: 'username does not exist'
            })
        }

        else {
            const UserPassword = CheckUser.password
            const result = await compare(password, UserPassword)

            if (result) {
                req.user = { token, CheckUser }
                next()
            }
            else res.status(403).json({
                process: false,
                mssg: 'user password does not match'
            })
        }
    }

    async Whoami(req, res, next) {
        const data = req.body

        try {
            const UserData = await User.CheckUserByUserName(data.UserName)

            res.status(206).json({
                id: UserData._id
            })
        }
        catch (err) {
            res.status(503).json({
                process: false,
                mssg: "server internal error"
            })
        }
    }

    async Delme(req, res, next) {
        const data = req.user.body
        await User.Find_by_id_and_Remove(data._id)
            .then(
                d => res.json({
                    process: true,
                    mssg: "user deleted"
                })
            )
            .then(
                d => console.log(d)
            )
            .catch(
                err => res.json({
                    process: false,
                    mssg: err
                })
            )

    }

    async KillTime(req, res, next) {
        const data = req.body
        let result = []

        data.map(
            async ({ id }) => {
                const job = await User.Find_by_id_and_Remove(id)
                result.push(job)
            }
        )

        res.json({
            result
        })

    }
}

module.exports = new Auth()