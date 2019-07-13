const express = require('express')
const router = express.Router()

const Post = require('../controllers/Post.controller')
const Auth = require('../controllers/Auth.controller')

router
    .get(
        '/',
        Post.list
    )

router
    .get(
        '/show/:id',
        Post.showPost
    )

router
    .get(
        '/search',
        Post.searchPost
    )

router
    .post(
        '/make',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        Post.make
    )

router
    .post(
        '/like/:id',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        Post.likePost
    )

router
    .post(
        '/comment/:id',
        Auth.ValidateUserToken,
        Auth.LoginBlock,
        Post.comment
    )

module.exports = router