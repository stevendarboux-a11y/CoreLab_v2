import mongoose from 'mongoose'

// Connexion mise en cache : en serverless (Vercel) le module est réutilisé
// entre plusieurs invocations, on ne se reconnecte donc pas à chaque requête.
let connectionPromise = null

export const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose)
  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI is not defined'))
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch(err => {
        connectionPromise = null
        throw err
      })
  }
  return connectionPromise
}
