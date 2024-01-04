const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all routes
const server = http.createServer(app);
const io = socketIO(server);

app.get('/api', (req, res) => {
  res.send('Hello World, from express');
});

app.use(function(req, res, next){
  res.json(404, {ERROR: 'Page not found.'});
});
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('login', (username) => {
    connectedUsers[socket.id] =  username;
    console.log('User logged in:', username);
  });

  socket.on('message', ({ recipient, message }) => {
    const sender = Object.keys(connectedUsers).find(
      (key) => {
        return connectedUsers[key] === socket.id;
      }
      );

    const  matched = Object.keys(connectedUsers).filter(function(key) {
      return connectedUsers[key] === recipient;
    });
    
      
    const recipientSocketId = socket.id;
    if (recipientSocketId) {
      matched.map((key) => {
        io.to(key).emit('message', { sender, message, id: socket.id });
      })
      console.log('Private message sent:', sender, '->', recipient);
    } else {
      console.log('Recipient not found:', recipient);
    }
  });

  socket.on('disconnect', () => {
    const disconnectedUser = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key] === socket.id
    );
    delete connectedUsers[disconnectedUser];
    console.log('User disconnected:', disconnectedUser);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
