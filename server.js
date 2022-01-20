const { request, response } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const productRouter = require('./routes/products');
const Product = require('./models/Product')
const socket = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

//import config
const config = require('./config/database');

//Mongoose Promise to Default Promise
mongoose.Promise = global.Promise;

//initialize express
const app = express();

//connect to mongoose

//mongoose.connect('mongodb://localhost/crudproduct');
mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db = mongoose.connection;

db.on('open', () => {
    console.log('Connected to the database.');
});
  
db.on('error', (err) => {
    console.log(`Database error: ${err}`);
});

// Enable cross-origin access through the CORS middleware
// NOTICE: For React development server only!
if (process.env.CORS) {
    app.use(cors());
}

// Set public folder using built-in express.static middleware
app.use(express.static("public"))

// Middleware Body Parser
app.use(bodyParser.json());

// Routes middleware
app.use('/products', productRouter);

// Middleware Error Handling
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(400).json({ err: err });
});

//Start the Server
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

//Set up socket io
const io = socket(server);
let online = 0;

io.on('connection', (socket) => {
  online++;
  console.log(`Socket ${socket.id} connected.`);
  io.emit('visitor enters', online);

  socket.on('add', data => socket.broadcast.emit('add', data));
  socket.on('update', data => socket.broadcast.emit('update', data));
  socket.on('delete', data => socket.broadcast.emit('delete', data));

  socket.on('disconnect', () => {
    online--;
    console.log(`Socket ${socket.id} disconnected.`);
    console.log(`Online: ${online}`);
  });
});