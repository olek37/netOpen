import Participation from '../models/participation'
import Tournament from '../models/tournament'
import Game from '../models/game'

// get data and user, get tournament limits, create games, add participation
const joinTournament = async (req, res) => {
  try {
    const { tournament_id } = req.body
    const user = req.user
  
    const { maxParticipants, deadline } = await Tournament.findOne({ _id: tournament_id})

    if( deadline < new Date() ) throw "Past deadline"

    const participations = await Participation.find({ tournament: tournament_id })
    
    if( participations.length == maxParticipants ) throw "Limit reached"

    await Promise.all(participations.map(async participation => {
      const opponent = participation.user
      const game = new Game({ players: [user._id, opponent], tournament: tournament_id })

      await game.save()
    }))
  
    const participation = new Participation({ user: user._id, tournament: tournament_id })
    await participation.save()

    res.send("You're in!")
  
  } catch(e) {
    console.error(e)

    res
      .status(500)
      .send(e)
  }
}


// get data and user, find game, check if winners match
const updateWinner = async (req, res) => {
  try {
    const { game_id, winner_id } = req.body
    const { _id: user_id } = req.user
    const game = await Game.findOne({ _id: game_id })

    if( game.last_updated_by != null && game.last_updated_by != user_id && game.winner == winner_id ) {
      game.result = winner_id
      await game.save()

      res.send("You both chose the same winner. Good game!")

    } else if( game.last_updated_by != null && game.last_updated_by != user_id ) {
      game.winner = null
      game.last_updated_by = null
      await game.save()

      res.send("You both chose a different winner. Choose again!")

    } else {
      game.winner = winner_id
      game.last_updated_by = user_id
      await game.save()

      res.send("Winner updated...")

    }
    
  } catch(e) {
    console.error(e)

    res
      .status(500)
      .send(e)
  }
}

export { joinTournament, updateWinner }