const mongoose = require('mongoose');

const { Schema } = mongoose;

// Schema for individual text content within a block
const BlockContentSchema = new Schema({
  type: { type: String },
  text: { type: String },
  styles: { type: Schema.Types.Mixed },
}, { _id: false });

// Schema for individual BlockNote blocks (paragraphs, headings, etc.)
const BlockSchema = new Schema({
  id: { type: String },
  type: { type: String },
  props: {
    backgroundColor: { type: String },
    textColor: { type: String },
    textAlignment: { type: String },
    level: { type: Number },
    isToggleable: { type: Boolean },
  },
  content: [BlockContentSchema],
  children: { type: Schema.Types.Mixed },
}, { _id: false });

// Schema for comments
const CommentSchema = new Schema({
  username: { type: String, required: true },
  date: { type: String },
  comment: { type: String, required: true },
}, { _id: false });

// Main Blog Schema
const BlogSchema = new Schema({
  // id: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  access: { type: String, required: true },
  categories: [{ type: String }],
  title: { type: String, required: true },
  date: { type: Date },
  location: {
    type: [Number],
    validate: {
      validator: (val) => val.length === 2,
      message: 'Location must be [latitude, longitude]',
    },
  },
  coverImage: { type: String },
  images: [{ type: String }],
  body: [BlockSchema],
  bodyChinese: [BlockSchema],
  comments: [CommentSchema],
}, {
  timestamps: true,
});

BlogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v

    if (returnedObject.date) {
      returnedObject.date = new Date(returnedObject.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  }
})

const Blog = mongoose.model('Blog', BlogSchema)

module.exports = Blog
