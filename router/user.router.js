const express = require('express')
const router = express.Router()

const User = require('../controllers/User.control')
const Auth = require('../controllers/Auth.controller')

/**
 * @name usr/cat
 * @description change User category
 * @example
 * url: server/usr/cat/?id=ID ;
 * 
 * request data:
 *  {
 *  UserName: 'UserName',
 *  password: 'password',
 * 
 *  
 * } 
 */

router
    .post(
        '/cat',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        User.ChangeUserCategory
        )

router
    .get(
        '/profile/:id',
        User.ShowUserProfile
        )

module.exports = router