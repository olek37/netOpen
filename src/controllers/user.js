import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import sendEmail from '../email'

import User from '../models/user'
import Token from '../models/token'

import { FE_PORT, SECRET } from '../constants'

// get data, hash password, create user, create token, send token to email
const signUp = async (req, res) => {
  try {
    const { name, surname, email, password: req_password } = req.body

    const password = bcrypt.hashSync(req_password, 10)

    const user = new User({ name, surname, email, password })
    await user.save()

    const value = jwt.sign({ email }, SECRET, { expiresIn: '24h'})
    const token = new Token({ value, user: user._id })
    await token.save()
    
    sendEmail(email, 'Confirm your account', `Go to localhost:${FE_PORT}/confirmAccount/${value} to confirm your account's creation`, `<p>Go to <a href="localhost:${FE_PORT}/confirmAccount/${value}">localhost:${FE_PORT}/confirmAccount/${value}</a> to confirm your account's creation</p>`)

    res.send('Confirmation email sent!')
    console.log(value)

  } catch (e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

// get token value, verify token value, find token, activate user, remove token
const confirmAccount = async (req, res) => {
  try {
    const { value } = req.body

    jwt.verify(value, SECRET)

    const token = await Token.findOne({ value })

    await User.updateOne({ _id: token.user }, { $set: { active: true }})

    res.send("Account confirmed!")

  } catch (e) {
    console.error(e)

    res
      .status(500)
      .send(e)
  }
}

// get email and password, compare passwords, generate jwt, send jwt
const signIn = async (req, res) => {
  try {
    const { email, password: req_password } = req.body
    const user = await User.findOne({ email })
    if( bcrypt.compareSync(req_password, user.password) ) {
      
      const token = jwt.sign({user_id: user._id}, SECRET)
      res.send(token)
      
    } else {
      
      throw "Wrong password"
    }
  } catch (e) {
    console.error(e)

    res
      .status(500)
      .send(e)
  }
}

// get users email, generate token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    const value = jwt.sign({ email }, SECRET, { expiresIn: '24h'})
    const token = new Token({ value, user: user._id })
    await token.save()
    
    sendEmail(email, 'Change your password', `Go to localhost:${FE_PORT}/changePassword/${value} to change your password`, `<p>Go to <a href="localhost:${FE_PORT}/changePassword/${value}">localhost:${FE_PORT}/changePassword/${value}</a> to change your password</p>`)

    res.send('Check your email!')
    console.log(value)

  } catch (e) {
    console.error(e)
    
    res
      .status(500)
      .send(e)
  }
}

const changePassword = async (req, res) => {
  try {
    const { value, password: req_password } = req.body

    jwt.verify(value, SECRET)

    const token = await Token.findOne({ value })
    const password = bcrypt.hashSync(req_password, 10)

    await User.updateOne({ _id: token.user }, { $set: { password }})
    
    const sessionToken = jwt.sign({user_id: token.user }, SECRET)
    res.send(sessionToken)

  } catch (e) {
    console.error(e)

    res
      .status(500)
      .send(e)
  }
}


export { signUp, signIn, confirmAccount, forgotPassword, changePassword }