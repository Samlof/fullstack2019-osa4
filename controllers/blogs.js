const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const all = await Blog.find({})
    .populate('user', { username: 1, name: 1 })

  response.json(all.map(b => b.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blog = new Blog(request.body)
    blog.user = user._id
    const result = await blog.save()
    // Save to user too
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    response.status(201).json(result.toJSON())
  } catch (e) {
    next(e)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(204).end()
    if (blog.user.toString() === user.id.toString()) {
      await Blog.findByIdAndDelete(request.params.id)
      // Remove blog from user as well, if it exists
      const blogIndex = user.blogs
        .findIndex(b => b.id.toString() === request.params.id)
      if (blogIndex > -1) {
        user.blogs.splice(blogIndex, 1)
        user.save()
      }
      response.status(204).end()
    } else {
      response.status(401).json({ error: "You don't own this blog" })
    }
  } catch (e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const res = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
    if (res) {
      response.json(res.toJSON())
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter