const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)



beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of helper.initialBlogs) {
    const blogObj = new Blog(blog)
    await blogObj.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs have id and not _id', async () => {
  const blogs = await api.get('/api/blogs')
  const blog = blogs.body[0]

  expect(blog.id).toBeDefined()
  expect(blog._id).not.toBeDefined()

})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "David Walsh Blog",
    author: "David Walsh",
    url: "https://davidwalsh.name/",
    likes: 3,
  }
  await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const res = await api.get('/api/blogs')
  const titles = res.body.map(b => b.title)

  expect(res.body.length).toBe(helper.initialBlogs.length + 1)
  expect(titles).toContain('David Walsh Blog')
})

test('a blog with no likes set, sets it to 0', async () => {
  const newBlog = {
    title: "David Walsh Blog",
    author: "David Walsh",
    url: "https://davidwalsh.name/"
  }
  const res = await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const retBlog = res.body

  expect(retBlog.likes).toBe(0)
})

test('a blog with no title is not added', async () => {
  const newBlog = {
    author: "David Walsh",
    url: "https://davidwalsh.name/",
    likes: 0
  }
  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)

  let res = await api.get('/api/blogs')

  expect(res.body.length).toBe(helper.initialBlogs.length)
})

test('a blog with no url is not added', async () => {
  const newBlog = {
    title: "David Walsh Blog",
    author: "David Walsh",
    likes: 0
  }
  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)

  let res = await api.get('/api/blogs')

  expect(res.body.length).toBe(helper.initialBlogs.length)
})
afterAll(() => {
  mongoose.connection.close()
})