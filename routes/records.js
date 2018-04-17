var express = require('express');
var router = express.Router();
var fs = require('fs');

var server = require('http').Server(express);
var socket = require('socket.io')(server);

router.get('/store', function(req, res, next) {
    res.render(__dirname + '/../views/index.ejs');
});

socket.on('connection', function(socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

module.exports = router;