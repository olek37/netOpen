import express from 'express'
import mongoose from 'mongoose'

const url = 'mongodb://localhost:27017/netOpen'
const app = express()
const port = 3000

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', function(err){
  console.error("connection error;", err);
});
db.once('open', function() {
  // we're connected!
});

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))