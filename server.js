const express = require('express');
const http = require('http');
const path = require('path');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
require('dotenv').config();


const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "MilloBot"

app.use(express.static(path.join(__dirname,'public')));

io.on('connection', socket => {
    
    socket.on('joinRoom', ({username,room}) => {

        const user = userJoin(socket.id,username,room);

        socket.join(user.room);


        socket.emit('message', formatMessage(botName,'Welcome to the chard Cord'));
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));
        
        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    })

    //Listen for chat message
    socket.on('chatMessage',(msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage( user.username ,msg)); 
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        //send users and room info
       
       
    })
})


server.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));