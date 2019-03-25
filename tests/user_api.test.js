const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')

const api = supertest(app)


const saltRounds = 10

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash("admin", saltRounds)
  const user = new User({
    "username": "root",
    "name": "admin",
    passwordHash
  })
  await user.save()
})

test('users are returned as json', async () => {
  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('user hashes don\'t show', async () => {
  const users = await api.get('/api/users')
  const user = users.body[0]

  expect(user.id).toBeDefined()
  expect(user._id).not.toBeDefined()
  expect(user.passwordHash).not.toBeDefined()

})

test('a valid user can be added', async () => {
  const user = {
    "username": "testUser",
    "name": "testUser",
    "password": "test"
  }
  await api.post('/api/users')
    .send(user)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const res = await api.get('/api/users')
  const nicks = res.body.map(b => b.username)

  expect(res.body.length).toBe(2)
  expect(nicks).toContain('testUser')
})

test('User with too short username can\'t be made', async () => {
  const user = {
    "username": "a",
    "name": "testUser",
    "password": "testasdw"
  }

  const result = await api.post('/api/users')
    .send(user)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  expect(result.body.error).toContain('Path `username` (`a`) is shorter')
})


test('User with too short password can\'t be made', async () => {
  const user = {
    "username": "testUser",
    "name": "testUser",
    "password": "tes"
  }

  const result = await api.post('/api/users')
    .send(user)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  expect(result.body.error).toContain('Password too short')
})

test('User with no username can\'t be made', async () => {
  const user = {
    "name": "testUser",
    "password": "testasdw"
  }

  const result = await api.post('/api/users')
    .send(user)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  expect(result.body.error).toContain('Path `username` is required.')
})

test('User with no password can\'t be made', async () => {
  const user = {
    "username": "testUser",
    "name": "testUser",
  }

  const result = await api.post('/api/users')
    .send(user)
    .expect(400)
    .expect('Content-Type', /application\/json/)
  expect(result.body.error).toContain('Password too short')
})

afterAll(() => {
  mongoose.connection.close()
})