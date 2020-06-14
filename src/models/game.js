import mongoose from 'mongoose'
import _ from '../db'

const schema = new mongoose.Schema({
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament'}
})

const Game = mongoose.model('Game', schema)

export default Game