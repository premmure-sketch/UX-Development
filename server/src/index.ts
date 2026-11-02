import { createApp } from './app'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000

const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`🚀 PulseWorkforce SQLite Backend API Server`)
  console.log(`📡 URL: http://localhost:${PORT}`)
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`)
  console.log(`📊 Stats:  http://localhost:${PORT}/api/dashboard/stats`)
  console.log(`👥 Staff:  http://localhost:${PORT}/api/employees`)
  console.log(`=======================================================`)
})

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down backend server...')
  server.close(() => {
    process.exit(0)
  })
})
