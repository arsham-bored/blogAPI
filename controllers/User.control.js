const UserModel = require('../models/User.model')
const mongoose = require('mongoose')

const { hash } = require('./Crypto.controller')
const { ImgDir, resize } = require('./Image.controll')
const fs = require('fs')

const { sign } = require("./Token.controller")

/**
 * interact with User model
 * @example
 * const user = new User()
 * user.create({
 *  name,
 *  UserName,
 *  bio, // limited to 60 character
 *  profile // a path to image
 * })
 */
class User {

    /**
     * 
     * @param {name} - user real name
     * @param {UserName} - user-name
     * @param {bio} - user bio, limited to 60 letter
     * @param {profile} - user profile image
     * 
     * @example
     * create({ name: 'Arsham', UserName: 'Magenta', bio: '', profile: 'data/path_to_img' })
     */
    async create({
        name,
        UserName,
        bio,
        profile,
        password
    }) {
        const user = await new UserModel({
            name,
            UserName,
            bio,
            profile,
            password
        })

        const result = await user.save()
        return result
    }

    /**
     * @param {String} name - search User by their unique UserName 
     */
    async CheckUserByUserName(name) {
        try {
            const result = await UserModel.findOne({ UserName: name })
            return result
        }
        catch (err) {
            return err
        }
    }

    async Find_by_id_and_Remove(id) {
        return UserModel.findByIdAndRemove(id)
    }

    async find(query, { onlyOne }) {
        switch (onlyOne) {
            case true:
                return UserModel.findOne(query)

            case false:
                return UserModel.find(query)
        }
    }

    async CheckUserNameToBeUnique(req, res, next) {
        const name = req.body.name
        User.CheckUserByUserName(name)
            .then(d => {
                if (d == null) {
                    res.json({
                        userExist: true,
                        mssg: 'User does not exist'
                    })

                    req.status = true
                }
                else {
                    res.json({
                        userExist: false,
                        mssg: 'User does exist'
                    })
                    req.status = false
                }
            })
    }

    /**
     * Change User Data (Category)
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @example
     * {
     *  url: 'server/usr?id=ID',
     *  req_body: {
     *      TOKEN: "validated TOKEN",
     *      UserName: "current UserName",
     *      password: "current password",
     *      new_data: {
     *          "name": "NEW_NAME",
     *          "password": "new passwrd(this will hash before)"
     * }
     * }
     * }
     */
    async ChangeUserCategory(req, res, next) {
        /* 
                const id = req.body.id
                const User = await UserModel.findOne({UserName: req.user.body.UserName})
                console.log('1', req.user)
                console.log(User)
                let NeedToChange = req.body.new
        
                // fix password bug. it never will be undefined
                let password = NeedToChange.password
                let UpdatingData = password == undefined ? { ...NeedToChange } : { ...NeedToChange, password: hashed_password() }
                let hashed_password = async () => await hash(password)
                console.log('2', UpdatingData)
        
                console.log(
                    `body: ${id}
                    real: ${User._id}
                    `
                )
        
                if (id === `${User._id}`) {
                    const updatedUser = await UserModel.findByIdAndUpdate(id, { $set: UpdatingData }, { new: true })
                    res.json({ updatedUser })
                }
        
                else {
                    res.json({
                        chageCategory: false,
                        mssg: 'UserID is not yours'
                    })
                }
         */

        async function DoChang(WhatToChange) {
            try {
                const update = await UserModel.findByIdAndUpdate(_id, WhatToChange, { new: true })

                res.status(206).json({
                    process: true,
                    mssg: "do POST request to auth/login to get new token with new data"
                })

            }
            catch (err) {
                console.log(err)
            }
        }

        const { _id } = req.user.CheckUser
        var WhatToChange = { ...req.body.new };

        if (WhatToChange.UserName !== undefined) {
            const RefuseMultiple = await UserModel.findOne({ UserName: WhatToChange.UserName })
            if (RefuseMultiple != null) res.status(306).json({
                process: false,
                mssg: "user with this username already exit"    
            })
        }

        if (WhatToChange.password !== undefined) {
            WhatToChange.password = await hash(WhatToChange.password)
            console.log("data is", WhatToChange)
            DoChang(WhatToChange)
        }

        else DoChang(WhatToChange)

    }

    async ShowUserProfile(req, res, next) {

        let { width, height } = req.query
        console.log(typeof width)

        const id = req.params.id
        const UserData = await UserModel.findById(id)
        const profilePath = UserData.profile
        const file = await ImgDir(profilePath)

        const test = resize(file, Number(width), Number(height))
        console.log(file, test)

        res.writeHead(200, { 'Content-Type': 'image/png' });
        test.pipe(res)

    }

}

const CheckUserNameToBeUnique = async (req, res, next) => {
    const name = req.body.name
    User.CheckUserByUserName(name)
        .then(d => {
            if (d == null) res.json({ result: true })
            else res.json({ result: false })
        })
}

module.exports = new User()
