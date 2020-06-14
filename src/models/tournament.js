import mongoose from 'mongoose'
import _ from '../db'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  max_participants: { type: Number, required: true },
  location: String,
  deadline: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const Tournament = mongoose.model('Tournament', schema)

export default Tournament