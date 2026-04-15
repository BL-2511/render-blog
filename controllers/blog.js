const blogRouter = require('express').Router()
const Blog = require("../models/blog")


blogRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({})

  // const blogs = await Blog
    // .find({}).populate('user')
  response.json(blogs)
})


blogRouter.get('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)
  // const blogs = await Blog.find({})
  console.log(request.params.id)
  // console.log(blogs)
  console.log(blog)

  // const blogs = await Blog
    // .find({}).populate('user')
  response.json(blog)
})


blogRouter.post('/create', async (request, response) => {
  const body = request.body
  const user = request.user

  console.log(request.user)

  const blog = new Blog({
    user: user,
    title: body.title,
    categories: body.categories,
    date: body.date,
    location: body.location,
    body: body.body,
    bodyChinese: body.bodyChinese,
    images: body.images,
    coverImage: body.coverImage
  })
  
  const result = await blog.save()
  response.status(201).json(result)

  const blogs = await Blog.find({})
  // console.log(blogs)

  // After saving blog to Blog Schema, need to update id in User Schema
  user.blogs = user.blogs.concat(result._id.toString())
  await user.save()

})


blogRouter.delete('/:id', async (request, response) => {
  
  // const user = request.user

  // const blog = await Blog.findById(request.params.id)

  console.log('id: ', request.params.id)

  await Blog.findByIdAndDelete(request.params.id)

  response.status(204).end()
})


blogRouter.put('/:id', async (request, response) => {
  console.log('request.params.id: ', request.params.id)
  console.log('request.body: ', request.body)

  const blog = await Blog.findById(request.params.id)

  blog.title = request.body.title
  blog.categories = request.body.categories
  blog.date = request.body.date
  blog.location = request.body.location
  blog.body = request.body.body
  blog.bodyChinese = request.body.bodyChinese
  blog.images = request.body.images
  blog.coverImage = request.body.coverImage
  blog.comments = request.body.comments

  console.log('blog: ', blog)

  const result = await blog.save()
  response.status(201).json(result)
})


module.exports = blogRouter