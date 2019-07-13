const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserModel2 = new Schema({
    name: {
        type: String,
        required: true
    },

    // username should be unique
    UserName: {
        type: String,
        required: true,
        unique: true
    },

    // bio limited to 1 paragraph
    bio: {
        type: String,
        default: '',
        maxlength: 60
    },

    profile: {
        type: String,
        required: false,
        default: 'data/0bde3c4954adba6c2b2508e9fd4f6ba4'
    },

    password: {
        type: String,
        require: true
    },

    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Posts'
        }
    ]

})

module.exports = mongoose.model('Users', UserModel2)