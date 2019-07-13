const express = require('express')
const app = express()
const conf = require('./config.json')

const http = require('http')
const https = require('https')
const http2 = require('http2')

const mongoose = require('mongoose') // this library help us to interact with mongoDB

mongoose
    .connect(conf.mongoDB_url, {useFindAndModify: false, useNewUrlParser: true})
    .then(console.log('mongoDB connected successfuly'))
    .catch(err => console.log(err))

// Here are all middlewares I gonna use for this app in general
const bodayParser = require('body-parser')
const morgan = require('morgan')

app.use(bodayParser.json())
app.use(morgan('dev'))

const authRouter = require('./router/auth.router')
const UserRouter = require('./router/user.router')
const PostRouter = require('./router/post.router')

app.use('/auth', authRouter)
app.use('/usr', UserRouter)
app.use('/post', PostRouter)

const fs = require('fs')

const credentials = {
    key: fs.readFileSync('sslcert/server.key', 'utf8'),
    cert: fs.readFileSync('sslcert/server.crt', 'utf8')
}


const { HTTP_PORT, HTTPS_PORT, HTTP2_PORT } = process.env

// setup local server
const ports = {
    http: HTTP_PORT || 3001,
    https: HTTPS_PORT || 8443,
    http2: HTTP2_PORT || 3002
}

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)
const http2Server = http2.createSecureServer(credentials, app)

const {log} = console

console.clear()
httpServer.listen(ports.http, () => log(`http: 127.0.0.1:${ports.http}`))
httpsServer.listen(ports.https, () => log(`https: 127.0.0.1:${ports.https}`))
http2Server.listen(ports.http2, () => log(`http2: 127.0.0.1:${ports.http2}`))
