const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser')
const defaultRouter = require('./Routes/defaultRouter');
const userRouter = require('./Routes/userRouter');
const roomRouter = require('./Routes/roomRouter');
const {databaseCredentials} = require("./config");
const {handleConnection} = require('./clientHandling');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(bodyParser.json());
app.use(defaultRouter);
app.use('/user', userRouter);
app.use('/rooms', roomRouter);

io.on('connect', (socket) => { handleConnection(socket, io) });

var mongoose = require('mongoose');
mongoose.connect( process.env.MONGODB_URI || databaseCredentials,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to DB'));
mongoose.Promise = global.Promise;

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));