import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import router from './routes/index.js'
import errorHandler from './middleware/errorHandler.js'
import { connectDB } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.text({ type: 'text/csv' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

// S'assure que MongoDB est connecté avant de traiter une requête API
app.use('/api', async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('MongoDB error:', err)
    res.status(503).json({ error: 'Database unavailable' })
  }
})
// Appelée par la GitHub Action keep-alive : sollicite la base pour éviter la mise en pause du cluster Atlas gratuit
app.get('/api/ping', async (req, res) => {
  await mongoose.connection.db.admin().ping()
  res.json({ status: 'ok', db: 'connected' })
})
app.use('/api', router)
app.use(errorHandler)

export default app
