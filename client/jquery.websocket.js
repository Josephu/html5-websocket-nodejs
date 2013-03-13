(function($) {
var ws;
var content;

function onWsMessage(message) {
   //alert(message.data);

   var json = JSON.parse(message.data);

   if (json.type === 'message') {
   	content.prepend('<p>' + json.data.message + '</p>');
   }
}

$.fn.receiveWebSocket = function () {
     content = this;

     ws.onmessage = onWsMessage;
};

$.fn.sendMessage = function () {
	$(this).click(function() {
    	ws.send("[message]");
	});
};

$.fn.createWebSocket = function () {
  message = this
  if ("WebSocket" in window){
     // Let us open a web socket
     ws = new WebSocket("ws://localhost:8080/start", ['echo-protocol']);
     ws.onopen = function(evt){
        alert(evt);
        $(message).html("<h3>Websocket Started</h3>");
     };
     ws.onclose = function(evt){ 
        // websocket is closed.
        $(message).html("<h3>Websocket Closed</h3>");
     };
     ws.onerror = function(evt){ 
        $(message).html("<h3>Websocket Error</h3>");
     };
  }
  else{
     // The browser doesn't support WebSocket
     alert("WebSocket NOT supported by your Browser!");
  }
};

})($);
