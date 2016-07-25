"use strict";

let fs = require('fs');

let Particle = require('particle-api-js');

let particle = new Particle();
var token;
particle.login(JSON.parse(fs.readFileSync('credentials.json'))).then((data) => {
  token = data.body.access_token;
  startStream(broadcastData);
});

function startStream(dataCallback) {
  let printData = (data) => { 
    let b = new Buffer(data.data), frames = [], idx = 0; 
    let numSensors = b[idx++], numFrames = b[idx++]; 
    for (let i = 0; i < numFrames; ++i) { 
      frames.push([]); 
      for (let j = 0; j < numSensors; ++j) { 
        frames[i].push(b[idx++]); 
      } 
    } 
    dataCallback(frames);
    console.log("data", frames);
  }

  particle.getEventStream({deviceId: "280020001547343339383037", auth: token}).then(function(stream) {
    stream.on('event', (data) => printData(data));
    stream.on('')
  }, (e) => console.log("error getting stream", e));
}

let dirListing = (d) => fs.readdirSync(d).map((f) => fs.statSync(`${d}/${f}`).isDirectory() ? dirListing(`${d}/${f}`) : `${d}/${f}`).reduce((p, c) => p.concat(c instanceof Array ? c : [c]), []);
let validStaticFiles = 
  ['index.html']
  .concat(dirListing('assets'));
console.log("VSF: ", validStaticFiles);
let staticServer = new (require('node-static')).Server();

let PORT = 3080;
let server = require('http').createServer((req, res) => {
  console.log("REQ: ", req.url);
  if (req.url[0] == '/' && validStaticFiles.indexOf(req.url.substr(1)) >= 0) {
    staticServer.serve(req, res);
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(fs.readFileSync('index.html', 'utf-8'));    
  }
}).listen(PORT, () => console.log(`Listening on port ${PORT}`));

let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({server: server});
wss.on('connection', (ws) => {
  console.log("new connection!");
})

function broadcastData(frames) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(frames));
  });
}

let i = 0;
setInterval(() => {
  broadcastData([[i+1,i+2,i+3,i+4,i+5],[i+2,i+4,i+6,i+8,i+10]]);
  i++;
}, 1000);