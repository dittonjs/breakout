const socketIO        = require('socket.io');
const express         = require('express');
const http            = require('http');
const UUID            = require('node-uuid');
const _               = require('lodash');
const verbose         = false;
const port            = 9000;
const app             = express();
const server          = http.Server(app);
const io              = socketIO(server);

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

    //Tell the server to listen for incoming connections
server.listen( port );

    //Log something so we know that it succeeded.
console.log('\t :: Express :: Listening on port ' + port );

    //By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){
    res.sendfile( __dirname + '/index.html' );
});

app.get('/*', (req, res) => {
  res.sendFile(`${__dirname}/${req.params[0]}`);
});

const players = [];
const readyPlayers = [];
let incrementalId = 0;
const gameObjects = {};
io.on("connection", (socket)=>{
  players.push(socket.id);
  let payload = {
    playerId: socket.id
  }
  if(players.length == 1){
    payload.isLeader = true;
  }
  socket.emit('player id assigned', payload);
  io.emit('player connected', { players });
  console.log('a user connected');
  socket.on('disconnect', function(){
    _.remove(players, (player) => player == socket.id);
    io.emit('player disconnected', { players });
    console.log('user disconnected');
  });

  socket.on('ready', () => {
    readyPlayers.push(socket.id);
    io.emit('player ready', {readyPlayers});
  });

  socket.on('instantiate', (gameObject)=>{
    console.log('GAME OBJECT INSTANTIATED')
    gameObject.serverId = incrementalId;
    gameObject.creatorId = socket.id;
    gameObjects[incrementalId] = gameObject;
    incrementalId+=1;
    io.emit(`${gameObject.name} instantiated`, gameObject);
  });

  socket.on('destroy', (data) => {
    console.log('GAME OBJECT DESTROY');
    const obj = gameObjects[data.id]
    if(!obj) return;
    _.merge(obj, data.attributes)
    delete gameObjects[data.id];
    io.emit(`${obj.name} destroyed`, obj);
  });

  socket.on('update', (data) => {
    _.merge(gameObjects[data.id], data.attributes);
    io.emit(`${gameObjects[data.id].name} updated`, gameObjects[data.id]);
  });
});
