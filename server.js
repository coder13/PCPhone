var fs = require("fs"),
    http = require("http"),
    socketIO = require("socket.io"),
    hapi = require("hapi"),
    port =  (process.argv[2]? +process.argv[2]:3000),
    port2 = port + 5;

var app = {

}, phone = {
    messages: []

};



var hapiServer = new hapi.Server('localhost', port2);

hapiServer.route({ method: '*', path: '/{p*}', handler: function(req, reply) {
    reply('not found').code(404);
}});

hapiServer.route({ method: 'POST', path: '/POSTsms', handler:function(req, reply) {
    message = JSON.parse(req.payload);
    console.log("From: ", message.from);
    console.log("message: ", message.content);
    phone.messages.push(message);
    sendMessage(message);
    reply(1);
}});

hapiServer.route({ method: 'POST', path: '/battery', handler:function(req, reply) {
    if (req.payload) {
        phone.battery = req.payload;
        console.log('BatteryLevel: ' + phone.battery);
        update("battery");
    }
    reply(1);
}});

hapiServer.route({ method: 'POST', path: '/uptime', handler:function(req, reply) {
    if (req.payload) {
        phone.uptime = +req.payload;
        console.log('Uptime: ' + phone.uptime + " seconds");
        update("uptime");
    }
    reply(1);
}});

hapiServer.route({method: 'GET', path: '/messages', handler:function(req, reply) {
    reply(JSON.stringify(phone));

}});

hapiServer.start(function () {
    console.log("hapi server running on @" + hapiServer.info.uri);
});

var httpServer = http.createServer(function(req, res) {
    try {
        if (req.url == "/") {
            res.writeHead(200, { "Content-type": "text/html"});
            res.end(fs.readFileSync(__dirname + "/index.html"));
        } else {
            var path = req.url.split('.');
            if (path[path.length-1] == 'js')
                res.writeHead(200, {"Content-type": "text/javascript"});
            else if(path[path.length-1] == 'css')
                res.writeHead(200, {"content-type": "text/css"});
            else
                res.writeHead(200, {"Content-type": "text/plain"});

            res.end(fs.readFileSync(__dirname + req.url));
        }
    } catch (e) {}
}).listen(port, function() {
    console.log("Listening at: http://localhost:" + port);
});

var socketServer = socketIO.listen(httpServer);
socketServer.on("connection", function (client) {
    client.emit('update', JSON.stringify({phone: phone}));

    client.on('update', function (data) {
        update();

    });
});

function update(which) {
    if (!which)
        socketServer.sockets.emit('init', JSON.stringify({phone: phone}));
    else {
        socketServer.sockets.emit('update', JSON.stringify({property:which, value:phone[which]}));
        console.log('sending: ', which, phone[which]);
    }
}

function sendMessage(message) {
    socketServer.sockets.emit('message', JSON.stringify(message));
}
