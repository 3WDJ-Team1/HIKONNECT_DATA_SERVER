var express = require('express');
var fs = require('fs');

var router = express.Router();

router.get('/', function(req, res) {
    res.send('1234');
});

router.post('/', function(req, res) {
    
});

module.exports = router;