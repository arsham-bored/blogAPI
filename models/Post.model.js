const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostModel = new Schema({
    Date: {
        type: Date,
        default: Date.now()
    },
    title: {
        type: String,
        required: true
    },
    header: {
        type: String,
        default: "default"
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    tags: [
        { type: String }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            content: String,
            date: {
                type: Date,
                default: Date.now()
            }
        }
    ]
})

module.exports = mongoose.model('Posts', PostModel)