const PostModel = require('../models/Post.model')
const UserModel = require('../models/User.model')

const Fuse = require('fuse.js')

class Post {

    async list(req, res) {
        console.log(req.query)

        const searchItem = async (req, res) => {
            const { id } = req.query
            const user = await UserModel.findById(id).populate('posts')
            if (user == null) res.status(404).json({
                process: false,
                mssg: 'Post does not exist'
            })

            else {
                res.status(206).json(
                    user.posts
                )
            }
        }

        if (req.query == {}) searchItem(req, res)
        else {
            const data = await PostModel.find({})
            res.json(data)
        }


    }

    async make(req, res, next) {

        const {
            title,
            header,
            content,
            author,
            tags
        } = req.body

        const post = new PostModel({
            title,
            header,
            content,
            author,
            tags
        })

        const data = await post.save()

        const { _id } = req.user.CheckUser
        const result = await UserModel.findByIdAndUpdate(_id, {
            $push: {
                posts: data._id
            }
        }, {new: true})

        let lastPost = result.posts.length - 1;
        res.json({
            process: true,
            newPostId: result.posts[lastPost]
        })
    }

    async searchPost(req, res) {

        const { text } = req.query

        const list = await PostModel.find({})
        const option = {
            caseSensitive: true,
            keys: [
                "title",
                "tags"
            ]
        }

        const fuse = new Fuse(list, option)
        const result = fuse.search(text)

        const quantity = result.length
        if (quantity == 0) res.status(404).json({
            found: false,
            mssg: 'no post found'
        })

        else {

            let dataToSend = []
            result.map(post => {
                const { title, header, _id, content } = post
                dataToSend.push({ _id, title, header, content: content.slice(0, 120) })
            })

            res.status(206).json(dataToSend)
        }
    }

    async likePost(req, res) {
        const PostID = req.param('id')
        const { _id } = req.user.CheckUser

        const CheckAlready = await PostModel.findById(PostID)
        const include = CheckAlready.likes.includes(_id)
        if (include) res.status(209).json({
            process: false,
            mssg: "User already liked"
        })

        try {
            const update = await PostModel.findByIdAndUpdate(PostID, { $push: { likes: _id } }, { new: true })
            if (update == null) res.status(404).json({
                process: false,
                mssg: "post not found"
            })

            else {
                res.status(206).json(update)
            }
        }

        catch (err) {
            res.status(403).json({
                process: false,
                mssg: 'User already did'
            })
        }
    }

    async showPost(req, res) {
        const { users } = req.query
        const id = req.param('id')

        if (users == 'true') {
            let post = await PostModel.findById(id).populate('author').populate('likes')

            const data = {
                Date: post.Date,
                header: post.header,
                content: post.content,
                author: {
                    UserName: post.author.UserName,
                    id: post.author._id
                },
                likes: [],
                tags: post.tags
            }

            post.likes.map(({ UserName, _id }) => data.likes.push({ UserName, _id }))


            res.json(post)
        }
        else {
            let post = await PostModel.findById(id).populate('author')
            const data = {
                Date: post.Date,
                header: post.header,
                content: post.content,
                author: {
                    UserName: post.author.UserName,
                    id: post.author._id
                },
                likes: post.likes.length,
                tags: post.tags
            }
            res.json(data)
        }
    }

    async comment(req, res, next) {
        const { content } = req.body
        const { id } = req.user.CheckUser
        const ToPost = req.param('id')

        try {
            const searchForPost = await PostModel.findById(ToPost)

            if (searchForPost == null) res.status(404).json({
                process: true,
                mssg: 'post does not exist'
            })
        }

        catch (err) {
            res.json({
                process: false,
                mssg: err
            })
        }

        const addComment = await PostModel.findByIdAndUpdate(
            ToPost,
            {
                $push: {
                    comments: {
                        user: id,
                        content,
                    }
                }
            },
            { new: true }
        )

        const userComment = addComment.comments.length - 1

        res.status(206).json({
            process: true,
            comment: addComment.comments[userComment]
        })

    }

}

module.exports = new Post()