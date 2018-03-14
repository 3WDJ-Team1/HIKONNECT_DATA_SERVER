var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next) {
    var files = fs.readdirSync('public/mountain');

    var fileListHTML = new String();
    
    for(let val in files){
        fileListHTML += `
        <a href="/mountain/${files[val]}">${files[val]}</a>
        <br />
        `;
    }
    
    res.send(fileListHTML);
});

router.get('/:mntCode', function(req, res, next) {
    var mntCode = req.params.mntCode;

    var files = fs.readdirSync(`public/mountain/${mntCode}`);

    var fileListHTML = new String();
    
    for(let val in files){
        fileListHTML += `
        <a href="/mountain/${mntCode}/${files[val]}">${files[val]}</a>
        <br />
        `;
    }

    res.send(fileListHTML);
});

module.exports = router;