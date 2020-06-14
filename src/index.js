import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { auth } from './auth'

import * as UserController from './controllers/user'
import * as TournamentActionsController from './controllers/tournament_actions'
import * as TournamentController from './controllers/tournament' 

import { PORT } from './constants'

import seed from './seed'
//seed()

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/confirmAccount', UserController.confirmAccount)
app.post('/signUp', UserController.signUp)
app.post('/signIn', UserController.signIn)
app.post('/forgotPassword', UserController.forgotPassword)
app.post('/changePassword', UserController.changePassword)

app.post('/tournaments/new', auth, TournamentController.create)
app.post('/tournaments', TournamentController.read)
app.post('/tournament', TournamentController.readOne)
app.post('/myOpen', auth, TournamentController.myOpen)

app.post('/joinTournament', auth, TournamentActionsController.joinTournament)
app.post('/updateWinner', auth, TournamentActionsController.updateWinner)

app.listen(PORT, () => console.log(`openNet listening at http://localhost:${PORT}`))