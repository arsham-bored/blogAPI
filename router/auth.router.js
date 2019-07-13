const express = require('express')
const Router = express.Router()

// DB and models
const UserModel = require('../models/User.model')
const Auth = require('../controllers/Auth.controller')

const Image = require('../controllers/Image.controll')
const SingleFile = Image.SingleFile

const User = require('../controllers/User.control')
// this is a HELL
const CheckUserNameToBeUnique = async (req, res, next) => {
    const name = req.body.name
    User.CheckUserByUserName(name)
        .then(d => {
            if (d == null) {
                res.json({
                    userExist: false,
                    mssg: 'User does not exist'
                })
            }
            else next()
        })
}


Router
    .get('/', (req, res) => {
        // this route is temporary
        UserModel
            .find({})
            .then(
                d =>
                    res.json(d)
            )

        res.end
    })

/**
 * Serving user signup form
 * @name auth/signup
 * @param {name} - user real name, no special character
 * @param {UserName} - user user-name
 * @param {bio} - user bio,  60 letter limitation
 * @param {img} - profile image with name of 'img'
 * @example
 * // INPUT
 * axios.post(
 *  'server/auth/signup',
 * {name, UserName, bio, img} // multipart form data
 * )
 * 
 * // OUTPUT
 * { "state": 206, "token": "..." }
 */
Router
    .post('/signup',
        SingleFile('img'),
        Auth.SignUp
    )

Router
    .post('/login',
        Auth.LoginCheck
    )

Router
    .post(
        '/whoami',
        Auth.ValidBlock,
        Auth.Whoami
    )

Router
    .post(
        '/delme',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        Auth.Delme
    )

// need to limitate
Router
        .post(
            '/killtime',
            Auth.KillTime
        )

Router
    .post('/test',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        (req, res) => res.send('done')
    )


module.exports = Router