import _ from 'lodash'
import bcrypt from 'bcrypt'

import User from './models/user'
import Tournament from './models/tournament'
import Game from './models/game'
import Participation from './models/participation'
import Token from './models/token'

const names = ['Ziemowit', 'Radzimir', 'Gniewomir', 'Mieszko', 'Krzesimir', 'Tadeusz', 'Jacenty', 'Ignacy', 'Waclaw', 'Zbyszko', 'Roch', 'Wit', 'Szczepan', 'Wincenty', 'Fryderyk', 'Wladyslaw', 'Lucjan', 'Przemyslaw', 'Radoslaw', 'Kazimierz', 'Dobrawa', 'Dabrowka', 'Halszka', 'Jadwiga', 'Jagna', 'Apolonia', 'Boguslawa', 'Lucja', 'Swietomira', 'Waclawa', 'Janina', 'Aniela', 'Alina', 'Ida', 'Bogna', 'Halina', 'Kalina', 'Odeta', 'Badzislawa', 'Jagoda']
const surnames = ['Olszewski', 'Jaworski', 'Wrobel', 'Malinowski', 'Pawlak', 'Witkowski', 'Walczak', 'Stepien', 'Gorski', 'Rutkowski', 'Michalak', 'Sikora', 'Ostrowski', 'Baran', 'Duda', 'Szewczyk', 'Tomaszewski', 'Pietrzak', 'Marciniak', 'Wroblewski', 'Zalewski', 'Jakubowski', 'Jasinski', 'Zawadzki', 'Sadowski', 'Bak', 'Chmielewski', 'Wlodarczyk', 'Borkowski', 'Czarnecki', 'Sawicki', 'Sokolowski', 'Urbanski', 'Kubiak', 'Maciejewski', 'Szczepanski', 'Kucharski', 'Wilk', 'Kalinowski', 'Lis', 'Mazurek', 'Wysocki', 'Adamski', 'Kazmierczak', 'Wasilewski', 'Sobczak', 'Czerwinski', 'Andrzejewski', 'Cieslak', 'Glowacki', 'Zakrzewski', 'Kolodziej', 'Sikorski', 'Krajewski', 'Gajewski', 'Szymczak', 'Szulc', 'Baranowski', 'Laskowski', 'Brzezinski', 'Makowski', 'Ziolkowski', 'Przybylski']
const locations = ['Warszawa', 'Poznań', 'Wrocław', 'Gdańsk', 'Łódź', 'Kraków']
const tournament_suffix = ['Open', 'Tour', 'Champions', 'Game', 'Finals']
const tournament_prefix = ['Grand', 'Amateur', 'Pro', 'Stars', 'Mega']

const adjustSurnames = (person) => {
  if( _.last(person.name) == 'a' && _.last(person.surname) == 'i') {
    return { ...person, surname: `${_.initial(person.surname).join('')}a`}
  }
  return person
}

const addEmail = (person) => ({ ...person, email: `${person.name}.${person.surname}@test.com`.toLowerCase() })
const addPassword = (person) => ({ ...person, password: bcrypt.hashSync(`${person.name}123`, 10) })
const addActive = (person) => ({ ...person, active: true })
const dbEntity = (person) => new User(person)

const generatePeople = (n) => _.zip(_.sampleSize(names, n), _.sampleSize(surnames, n))
  .map(person => ({ name: person[0], surname: person[1] }))
  .map(adjustSurnames)
  .map(addEmail)
  .map(addPassword)
  .map(addActive)
  .map(dbEntity)

const randomDate = (from, to) => new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()))

const generateTournaments = (n, people) => _.range(n).map(() => {
  const organizer = _.sample(people)._id
  const location = _.sample(locations)
  const name = `${_.sample(tournament_prefix)} ${ location } ${ _.sample(tournament_suffix) }`
  const deadline = randomDate(new Date('Feb 10, 2020'), new Date('Dec 22, 2020'))
  const max_participants = _.random(3, 12)
  return new Tournament({ organizer, location, deadline, name, max_participants })
})

const generateParticipations = (tournaments, people) => _.flattenDeep(tournaments.map(tournament => {
  const participants_count = _.random(tournament.max_participants/2, tournament.max_participants)
  const participants = _.sampleSize(people, participants_count)
  return participants.map(p => new Participation( { tournament: tournament._id, user: p._id }))
}))

const generateGames = (tournaments, participations) => _.flattenDeep(tournaments.map(tournament => {
  const tournaments_participations = _.flatten(participations).filter(p => p.tournament === tournament._id)
  const ids = tournaments_participations.map(p => p.user)
  // :<  
  let games = []
  for(let i = 0; i < ids.length - 1; i++) {
    for(let j = i+1; j < ids.length; j++) {
      games.push(
        new Game({ 
          tournament: tournament._id, 
          players: [ids[i], ids[j]],
          result: _.random(0,10) > 4 ? _.sample([ids[i], ids[j]]) : null
        })
      )
    }
  }
  return games
}))

const getSaved = async (docs) => await Promise.all( docs.map( async doc =>  {
  try {
    await doc.save()
    return doc
  } catch(e) {
    console.log(e)
    return null
  }
}).filter(d => d))

const seed = async () => {
  User.deleteMany({}, () => {})
  Token.deleteMany({}, () => {})
  Tournament.deleteMany({}, () => {})
  Game.deleteMany({}, () => {})
  Participation.deleteMany({}, () => {})
  const people = await getSaved(generatePeople(20))
  const tournaments = await getSaved(generateTournaments(14, people))
  const participations = await getSaved(generateParticipations(tournaments, people))
  const games = await getSaved(generateGames(tournaments, participations))
  const admin = new User({ name: 'Olek', surname: 'Hauzinski', email: 'olek@test.com', active: true, password: bcrypt.hashSync('Olek123', 10) })
  await admin.save()
}

export default seed