import Game from '../models/tournament'

// get id param, find tournament, send stringified tournament
const readOne = async (req, res) => {
  try {
    const { id } = req.params
  
    const game = await Game.findOne({ _id: id })
  
    res.send(game)

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
    const { offset, count } = req.body

    const games = await Games.find({})
  
    res.send({
      count: games.length,
      tournaments: games.slice(offset, offset + count)
    })

  } catch(e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

export { readOne, read }