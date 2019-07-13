const bcrypt = require('bcryptjs')

/**
 * Cryptography using salt
 */
class Crypto {

    /**
     * Hash password by saly
     * @param {Strig} password 
     */
    async hash(password) {
        return new Promise((res, rej) => {
            bcrypt.hash(password, 8, (err, hash) => {
                if(err) rej(err)
                else res(hash)
            })
        })
    }

    
    async compare(text, hash) {
        return new Promise((res, rej) =>
            bcrypt.compare(text, hash, (err, result) => {
                if(err) rej(err)
                else res(result)
            })
        )
    }
}

const test = async () => {
    const blah = new Crypto()
    const result = await blah.compare('arshsam82', '$2a$08$roM46OqhFRmpSP4GJHDZyOOyZsGJ/j8ZsZ6OzSIAOzFxw4jaqa/Sa')
    console.log(result)
}


module.exports = new Crypto()