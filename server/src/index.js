import app from './app.js'
import { connectDB } from './db.js'
import { startNotificationJob } from './jobs/notificationJob.js'

connectDB()
  .then(() => {
    console.log('MongoDB connected')
    startNotificationJob()
  })
  .catch(err => console.error('MongoDB error:', err))

app.listen(process.env.PORT || 4242, () => console.log(`Server running on port ${process.env.PORT || 4242}`))
