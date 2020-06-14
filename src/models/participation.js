import mongoose from 'mongoose'
import _ from '../db'

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament'}
})

const Participation = mongoose.model('Participation', schema)

export default Participation