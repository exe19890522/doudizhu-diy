const socket = require('socket.io');
const app = socket(3000);
app.on('connection',function (socket) {
    console.log('a user connect');
    socket.emit('welcome','hello world');
});

