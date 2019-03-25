const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const all = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1 })

  response.json(all.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  // password validation
  if (!body.password || body.password.length < 4) {
    return response.status(400).json({
      error: 'Password too short'
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  try {
    const result = await user.save()
    response.status(201).json(result.toJSON())
  } catch (e) {
    next(e)
  }
})


module.exports = usersRouter