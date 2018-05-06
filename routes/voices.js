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

        try{
            fs.writeFileSync('test.3gpp', data, 'utf-8');
            console.log('Successed!!');
        }catch(e){
            console.log(e);
        }
    });

    socket.on('close', function() {
        console.log('-------client disconnected-------');
    });
});

server.on('error', function(err) {
    console.log('err' + err);
});

server.listen(9206, function() {
    console.log('-------Server start-------');
});

router.get('/', function(req, res) {
    res.send('1234');
});

router.post('/', function(req, res) {
    
});

module.exports = router;