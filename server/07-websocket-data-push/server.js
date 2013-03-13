var http = require("http");
var url = require("url");
var WebSocketServer = require('websocket').server;

// Connected WebSocket clients
var clients = [];

function start(route, handlers) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    console.log("Request for " + pathname + " received.");

    route(pathname, handlers, response, query, clients);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("HTTP request received.");
    response.end();
  }

  var server = http.createServer(onRequest).listen(8080, function() {
     console.log("Server has started and is listening on port 8080.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false  // new request will trigger request event, and respond with request object that need to be accepted or rejected
  });

  function onWsConnMessage(message) {
    if (message.type == 'utf8') {
      console.log('Received message: ' + message.utf8Data);
    } else if (message.type == 'binary') {
      console.log('Received binary data.');
    }
  }

  function onWsConnClose(reasonCode, description) {
    console.log('Peer disconnected with reason: ' + reasonCode);
  }

  function onWsRequest(request) {
    var find = false
    // Check if protocol is valid
    request.requestedProtocols.map(function(protocol){
      if (protocol == 'echo-protocol')
        find = true;
    });
    if(find == true){
      var connection = request.accept('echo-protocol', request.origin); // accept is needed since autoAcceptConnections: false
      console.log("WebSocket connection accepted, host: "+ request.host+" , protocol: "+connection.protocol);

      // Save clients (unlimited clients)
      clients.push(connection);

      connection.on('message', onWsConnMessage);
      connection.on('close', onWsConnClose);
    }
    else{
      request.reject();
      console.log("WebSocket connection rejected, host: "+ request.host);
    }
  }

  function onWsClose(closeReason,description){
    console.log('Web socket server closing with reason: ' + reasonCode);
  }

  wsServer.on('request', onWsRequest);

  // Nodejs event
  process.on( 'SIGINT', function() {
    console.log( "\ngracefully shutting down from  SIGINT (Crtl-C)" );
    wsServer.on('close', onWsClose);
    // some other closing procedures go here
    process.exit();
  })
}

// Export functions
exports.start = start;
