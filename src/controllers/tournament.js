import Tournament from '../models/tournament'
import Game from '../models/game'
import Participation from '../models/participation'
import User from '../models/user'
import _ from 'lodash'
import { SECRET } from '../constants'
import jwt from 'jsonwebtoken'

// get data, create tournament, send id
const create = async (req, res) => {
  try {
    const tournament_data = req.body
  
    const tournament = new Tournament({ ...tournament_data, deadline: new Date(tournament_data.deadline), organizer: req.user._id })
    await tournament.save()

    res.send(tournament._id)

  } catch(e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

// get id param, find tournament, send stringified tournament
const readOne = async (req, res) => {
  try {
    const { id } = req.body
  
    const tournament = await Tournament.findOne({ _id: id })
    const games = await Game.find({ tournament: tournament._id })
    const participations = await Participation.find({ tournament: tournament._id })

    const users = await Promise.all( participations.map(async p => await User.findOne({ _id: p.user }, { name: 1, surname: 1 })) )
    
    try {
      const token = req.headers.authorization.replace('Bearer ', '')
      const { user_id } = jwt.verify(token, SECRET)
      const user = await User.findOne({ _id: user_id})
      const joined = await Participation.findOne({ tournament: tournament._id, user: user._id })

      res.send({ tournament, games, users, joined })

    } catch(e) {
      console.error(e)
      res.send({ tournament, games, users, joined: false })
    }
  

  } catch(e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

// return tournaments from given interval
const read = async (req, res) => {
  try {
    const { offset, count, search } = req.body

    const tournaments = await Tournament.find({}, null, { sort: {'name': 1} })
    const filtered = tournaments
      .filter(tournament => search.length == 0 || tournament.name.indexOf(search) >= 0)

    res.send({
      count: filtered.length,
      tournaments: filtered.slice(offset, offset + count)
    })

  } catch(e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

const myOpen = async (req, res) => {
  try {
    const user_id = req.user._id
    const participations = await Participation.find({ user: user_id })

    const tournaments = await Promise.all( participations.map( async (p) => await Tournament.findOne({ _id: p.tournament })) )

    const games = _.flattenDeep(await Promise.all( participations.map( async (p) => await Game.find({ tournament: p.tournament }) )))

    const user_games = games.filter( game => {
      const isFirst = game.players[0]._id.toString() == user_id
      const isSecond = game.players[1]._id.toString() == user_id
      return (isFirst || isSecond) && game.result == null
    })

    const mapped_games = await Promise.all(user_games.map( async game => {
      const player1 = await User.findOne({ _id: game.players[0]._id })
      const player2 = await User.findOne({ _id: game.players[1]._id })

      const tournament = await Tournament.findOne({ _id: game.tournament})
      return { ...game, players: [{ _id: player1._id, name: player1.name, surname: player1.surname }, { _id: player2._id, name: player2.name, surname: player2.surname }], tournament }
    }))
    
    const me = await User.findOne({ _id: user_id })

    res.send({ tournaments, games: mapped_games, my_id: user_id, my_name: `${me.name} ${me.surname}` })

  } catch(e) {

    console.error(e)

    res
      .status(500)
      .send(e)
  }
}

export { create, readOne, read, myOpen }