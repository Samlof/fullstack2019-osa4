const mongoose = require('mongoose')


const blogSchema = mongoose.Schema({
  author: String,
  title: { type: String, required: true },
  url: { type: String, required: true },
  likes: { type: Number, default: 0 }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

if (process.env.NODE_ENV === 'test') {
  module.exports = mongoose.model('Testing_Blog', blogSchema)
} else {
  module.exports = mongoose.model('Blog', blogSchema)
}
