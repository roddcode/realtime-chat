import express from 'express'
import logger from 'morgan'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@libsql/client'
import { Server } from 'socket.io'
import http from 'http'

dotenv.config()

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {},
})

const db = createClient({
  url: 'libsql://realtime-chat-roddcode.turso.io',
  authToken: process.env.DATABASE_TOKEN,
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    user TEXT
  );
`)

io.on('connection', async (socket) => {
  console.log('A user has connected')

  socket.on('disconnect', async () => {
    console.log('A user has disconnected')
  })

  socket.on('chat message', async (msg) => {
    let result
    const username = socket.handshake.auth.username ?? 'Anonymous'
    try {
      result = await db.execute({
        sql: `INSERT INTO messages (content, user) VALUES (:msg, :username)`,
        args: { msg, username },
      })
    } catch (e) {
      console.error(e)
      return
    }
    io.emit('chat message', msg, result.lastInsertRowid.toString(), username)
  })

  console.log(socket.handshake.auth)

  if(!socket.recovered) {
    try {
      const result = await db.execute({
        sql: `SELECT id, content FROM messages where id > ?`,
        args: [socket.handshake.auth.serverOffset],
      })
      result.rows.forEach(row => {
        io.emit('chat message', row.content, row.id.toString(), 'Anonymous')
      })
    } catch (e) {
      console.error(e)
      return
    }
  }
})

app.use(logger('dev'))

app.get('/', (req, res) => {
  const cwd = process.cwd()
  const dirname = path.dirname(cwd)
  res.sendFile(path.join(dirname, 'server', 'index.html'))
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
