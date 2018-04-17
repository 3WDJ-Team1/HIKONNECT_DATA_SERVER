var express = require('express');
var fs = require('fs');
var net = require('net');
var http = require('http');
var router = express.Router();
var port = 9206;
// var mSocket = new net.Socket();
// var option = {
//     host='',
//     port = 9206
// };

// mSocket.connect(option, function() {
//     //
// });

// mSocket.on('data', function() {
//     //
// });

var server = net.createServer(function(socket) {
    console.log(socket.address().address + "connected");

    socket.on('data', function(data) {
        console.log('Data is comming!!');
        
        
        // fs.stat("/record.3GPP", function(err,data) {
        //     if(err) throw err;
        //     console.log(stats);
        //     console.log('isFile: ' + stats.isFile());
        // });
    });

    socket.on('close', function() {
        console.log('client disconnected');

        
    });

    socket.write('welcome to server');
});

server.on('error', function() {
    console.log('err'+err);
});

server.listen(port, function() {
    console.log('서버 start');
});

router.get('/', function(req, res) {
    res.send('1234');
});

router.post('/', function(req, res) {
    
});

module.exports = router;