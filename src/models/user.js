import mongoose from 'mongoose'
import _ from '../db'

const schema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, index: {unique: true} },
  password: { type: String, required: true }
})

const User = mongoose.model('User', schema)

export default User