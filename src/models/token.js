import mongoose from 'mongoose'
import _ from '../db'

const schema = new mongoose.Schema({
  value: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const Token = mongoose.model('Token', schema)

export default Token