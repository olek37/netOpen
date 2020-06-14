import mongoose from 'mongoose'
import { DB_URL } from './constants'

mongoose.connect(DB_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true 
})

export default mongoose.connection