const express = require('express');
const app = express();
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({extended : true}));
app.use(express.json());

http.listen(8080 , ()=>{
    console.log('listening on 8080');
})

//? socket programming 
//! io.emit은 모든 유저에게 보내지게됨.
//! io.sockets.adapter.rooms.keys() 모든방이름과 소켓이 들어있음. 방이름으로 어떤소켓들이 들어있는지 알 수 있음(연결해재시 자동으로 소켓은없어짐)
//! socket.rooms 소켓의포함된 방이름이다. 
//! io.to('DefaultRoom').emit('GETuserList') 해당방에다가 보냄
//! socket.leave(룸이름) 해당방을 나가게됨

io.on('connection' , function(socket){ //! 접속시
    socket.join('DefaultRoom'); //! 이건 왜 콜백함수가 없지? 암튼 접속하면 바로 기본방으로 접속됨
    io.to('DefaultRoom').emit('GETuserList',[...io.sockets.adapter.rooms.get('DefaultRoom')]); //? 유저가 접속하면 DefaultRoom에 있는사람들에게 전부 유저목록을 최신화해줌

    socket.on('GETmySocketId' , function(cb){
        cb(socket.id);
    });

    socket.on('POSTchat' , function(data , cb){ //? data.target -> 보낼방 , data.msg챗메세지.
        io.to(data.target).emit('GETchat' ,  {id : socket.id , msg : data.msg}); //? 해당방에 메세지보냄.
        if(cb) cb();
    })

    socket.on('POSTleave' , function(roomId,cb){ //? 해당방 나가기
        socket.leave(roomId);
        io.to('DefaultRoom').emit('GETuserList',[...io.sockets.adapter.rooms.get('DefaultRoom')]); //?광장유저정보 최신화
        if(cb)cb();
    })
})