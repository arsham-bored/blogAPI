const jwt = require('jsonwebtoken')
const secret_plan = require('../config.json').secret

/**
 * Make token from user's data . (jwt: json web token)
 */
class Token {

    /**
     * @param {*} payload - Data which gonna get token
     * @param {*} secret - the secret of token, it should be really private
     * @example
     * new Token().sign('the data', 'secret').then(d => console.log(d))
     */
    async sign(payload, secret = secret_plan) {
        return new Promise((res, rej) => {
            jwt.sign(
                payload,
                secret,
                (err, data) => {
                    if(err) rej(err)
                    else res(data)
                }
            )
        })
    }

    /**
     * 
     * @param {*} token - token which gonna verify 
     * @param {String} secret - secret based on token
     * @example
     * new Token().verify('token', 'secret').then(d => console.log(d))
     */
    async verify(token, secret) {
        return new Promise((res, rej) => {
            jwt.verify(
                token,
                secret,
                (err, data) => {
                    if (err) rej(err)
                    else res(data)
                }
                )
        })
    }


}

const test = new Token()
test.sign(
    {data: 'data'},
    
)

module.exports = new Token()
