var express = require('express');
var router = express.Router();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/', function (req, res) {

});

module.exports = router;