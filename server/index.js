import express from "express"
import logger from "morgan"
import path from "node:path"
import dotenv from 'dotenv'
import { createClient } from "@libsql/client"
import { Server } from "socket.io"
import {createServer} from 'node:http'

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {
    enabled: true,
    reconnection: {
      maxDelay: 10000
  }}
})


io.on('connection', (socket) => {
  console.log('an user has connected');

  socket.on('disconnect', () => {
    console.log('an user has disconnected');
  })

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
})})

app.use(logger('dev'))


app.get('/', (req, res) => {
  const cwd = process.cwd();
  const dirname = path.dirname(cwd);
  res.sendFile(path.join(dirname, 'client', 'index.html'))
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})