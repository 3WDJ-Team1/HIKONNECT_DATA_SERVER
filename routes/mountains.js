var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/fs', function(req, res, next) {

    var files = fs.readdirSync('public/mountain');

    var fileListHTML = new String();

    for(let val in files){

        fileListHTML += `
            <a href="/mountain/${files[val]}">${files[val]}</a><br />
        `;
    }

    res.send(fileListHTML);

});

router.get('/fs/:mntCode', function(req, res, next) {

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

router.get('/query', function(req, res, next) {

    var dirs = fs.readdirSync('public/mountain');

    var resData = new Array();

    var resStr = new String();

    for (let val in dirs) {

        let fileName = fs.readdirSync('public/mountain/' + dirs[val])[0];

        fileName = fileName.substr(0, fileName.length - 5);

        let strSplit = fileName.split('_');
        
        let mntCode = strSplit[strSplit.length - 1];

        let mntName = strSplit[strSplit.length - 2];

        resData.push(
            {
                mntName: mntName,
                mntCode: mntCode
            }
        );

        resStr += 
        `
            INSERT INTO mountain 
            VALUES(${mntCode}, '${mntName}');<br />
        `;
    }

    res.send(resStr);
});

module.exports = router;