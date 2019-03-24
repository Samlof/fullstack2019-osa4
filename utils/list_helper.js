const dummy = () => 1

const totalLikes = blogs => blogs.reduce((acc, b) => acc + b.likes, 0)

const favoriteBlog = blogs => blogs.reduce((acc, b) => b.likes > acc.likes ? b : acc, { likes: -1 })

const mostBlogs = blogs => {
  const blogCounts = []
  blogs.forEach(blog => {
    const entry = blogCounts.find(ent => ent.author === blog.author)
    if (entry) entry.blogs++
    else blogCounts.push({ author: blog.author, blogs: 1 })
  });

  return blogCounts.reduce((acc, entry) => entry.blogs > acc.blogs ? entry : acc, { blogs: -1 })
}

const mostLikes = blogs => {
  const blogCounts = []
  blogs.forEach(blog => {
    const entry = blogCounts.find(ent => ent.author === blog.author)
    if (entry) entry.likes += blog.likes
    else blogCounts.push({ author: blog.author, likes: blog.likes })
  });

  return blogCounts.reduce((acc, entry) => entry.likes > acc.likes ? entry : acc, { likes: -1 })
}
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}