//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');
//var shared = require('/shared.js')

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

var t0 = null;
var x1 = 0.0, y1 = 0.0, x2 = 0.0, y2 = 0.0;
var p1 = null, p2 = null;
var px = 0.0, py = 0.0, pz = -1.0;
var vx = Math.random() - 0.5, vy = Math.random() - 0.5, vz = 1.0;
var w = 0.2;

function gameLoop() {
  var t = (new Date()).getTime();
  var dt = (t - t0) / 1000.0;
  t0 = t;
  px += vx * dt;
  py += vy * dt;
  pz += vz * dt;
  if (px <= -1) { px = -2 - px; vx *= -1; }
  if (px >=  1) { px =  2 - px; vx *= -1; }
  if (py <= -1) { py = -2 - py; vy *= -1; }
  if (py >=  1) { py =  2 - py; vy *= -1; }
  if (pz <= -1) { pz = -2 - pz; vz *= -1; }
  if (pz >=  1) {
    if (Math.abs(px - (pz - 1) * vx / vz - x1) <= w/2 && Math.abs(py - (pz - 1) * vy / vz - y1) <= w/2) {
      pz =  2 - pz;
      vz *= -1;
    } else {
      px = py = 0; pz = -1;
      vx = Math.random() - 0.5; vy = Math.random() - 0.5; vz = 1.0;
    }
  }
  setTimeout(gameLoop, 0);
}

io.on('connection', function (socket) {
  if ( !p1 ) {
    p1 = socket;
    p1.on('message', function (msg) {
      x1 = msg[0]; y1 = msg[1];
      p1.emit('message', { ball: [px, py, pz], paddle: [x2, y2] });
    });
  } else if ( !p2 ) {
    p2 = socket;
    p2.on('message', function (msg) {
      x2 = -msg[0]; y2 = msg[1];
      p2.emit('message', { ball: [-px, py, -pz], paddle: [-x1, y1] });
    });
    t0 = (new Date()).getTime();
    setTimeout(gameLoop, 0);
  } else {
    return; //?
  }

  socket.on('disconnect', function () {
    process.exit(0);
  });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Pong server listening at", addr.address + ":" + addr.port);
});
