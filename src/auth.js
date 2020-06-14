import jwt from 'jsonwebtoken'
import User from './models/user'

import { SECRET } from './constants'

export const auth = async (req, res, next) => {
  try {
    if(!req.headers.authorization) throw 'No auth header'

    const token = req.headers.authorization.replace('Bearer ', '')

    const { user_id } = jwt.verify(token, SECRET)
  
    const user = await User.findOne({ _id: user_id})

    req.user = user
    req.token = token

    next()
  } catch(e) {
    console.error(e)

    res
      .status(401)
      .send(e)
  }
}