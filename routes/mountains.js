var express = require('express');
var router = express.Router();
var fs     = require('fs');
var http   = require('http');
var mysql  = require('mysql');
require('dotenv').config();

router.get('/fs', function(req, res, next) {

    var files        = fs.readdirSync('public/mountain');
    var fileListHTML = new String();

    for(let val in files){

        fileListHTML += `
            <a href="/mountain/${files[val]}">${files[val]}</a><br />
        `;
    }

    res.send(fileListHTML);

});

router.get('/fs/:mntCode', function(req, res, next) {

    var mntCode      = req.params.mntCode;
    var files        = fs.readdirSync(`public/mountain/${mntCode}`);
    var fileListHTML = new String();

    for(let val in files){

        fileListHTML += `
        <a href="/mountain/${mntCode}/${files[val]}">${files[val]}</a>
        <br />
        `;
    }

    res.send(fileListHTML);

});

router.get('/query/mnt_name_and_mnt_code', function(req, res, next) {

    var dirs    = fs.readdirSync('public/mountain');
    var resData = new Array();
    var resStr  = new String();

    for (let val in dirs) {

        let fileName = fs.readdirSync('public/mountain/' + dirs[val])[0];
        fileName     = fileName.substr(0, fileName.length - 5);
        
        let strSplit = fileName.split('_');
        let mntCode  = strSplit[strSplit.length - 1];
        let mntName  = strSplit[strSplit.length - 2];

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

router.get('/query/distanceOfFid', (req, res, next) => {

    var connection = mysql.createConnection({
        host     : process.env.DB_HOST,
        user     : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
    });
    connection.connect();

    (function() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT mnt_id FROM mountain', (err, rows, fields) => {
                if (!err) {
                    console.log('Success');

                    var mntCodeSet = new Array();

                    for(let idx in rows) {
                        let mntCode = rows[idx].mnt_id;
        
                        mntCodeSet.push(mntCode);
                    }
                    resolve(mntCodeSet);
                } else {
                    console.log('Error: ' + err);
                }

                connection.end();
            });
        });
    })().then((fidSet) => {
        // var paths = fidSet.map((mntCode, idx) => {
        //     return new Promise((resolve, reject) => {
        //         resolve(getPathsOfFid(0, mntCode));
        //     });
        // });

        var paths = fidSet.map((mntCode, idx) => {
            return getPathsOfFid(0, mntCode);
        });
    });

    // var paths = function() {
    //     return new Promise((resolve, reject) => {
    //         resolve(getPathsOfFid(fid, mntCode));
    //     });
    // };

    res.send('');
});

router.get('/getCurrentFID', function(req, res, next) {

    var reqMntCode  = req.query.mntCode;
    var reqFidSet   = Array.from(JSON.parse(req.query.fidSet));
    var reqLat      = req.query.lat;
    var reqLng      = req.query.lng;

    var hikingRoute = {};

    var httpResult = reqFidSet.map((fid, idx) => {
        return new Promise((resolve, reject) => {
            resolve(getPathsOfFid(fid, reqMntCode));
        });
    });

    Promise.all(httpResult)
    .then((result) => {
        var minDis      = +Infinity;
        var currentFid;

        for (let resIdx in result) {
            let fid = result[resIdx];

            for (let fidIdx in fid) {
                let locationSet = fid[fidIdx];
                for(let locationIdx in locationSet) {
                    let lat = locationSet[locationIdx]['lat'];
                    let lng = locationSet[locationIdx]['lng'];

                    console.log(`lat: ${lat}, lng: ${lng}`);

                    let distance = calcDistance(lat, lng, reqLat, reqLng);

                    if (distance < minDis) {
                        minDis      = distance;
                        currentFid  = fidIdx;
                    }
                }
            }
        }

        if (minDis > 1000.0) {
            res.send('Illegal location');
        } else {
            res.json({
                fid: currentFid,
                distance: minDis,
            });
        }
    }).catch((err) => {
        res.send(err);
    });

    function calcDistance(lat1, lon1, lat2, lon2) {

        var radlat1  = Math.PI * lat1/180;
        var radlat2  = Math.PI * lat2/180;
        var theta    = lon1-lon2;
        var radtheta = Math.PI * theta / 180;
        var dist     = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist         = Math.acos(dist);
        dist         = dist * 180 / Math.PI;
        dist         = dist * 60 * 1.1515;

        dist = dist * 1.609344 * 1000;

        return dist
    }
});

module.exports = router;

function distance(lat1, lon1, lat2, lon2) {
         
    let theta = lon1 - lon2;
    let dist  = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2))
        + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
     
    dist = Math.acos(dist);
    dist = rad2deg(dist);
    dist = dist * 60 * 1.1515;
     
    if (unit == "kilometer") {
        dist = dist * 1.609344;
    } else if(unit == "meter"){
        dist = dist * 1609.344;
    }

    return (dist);
}

function getPathsOfFid(fid, mntCode) {
    return new Promise((resolve, reject) => {
        let options = {
            host: 'localhost',
            port: 3000,
            path: `/paths/${mntCode}/${fid}`,
        }

        http.request(options, (response) => {
            var serverData = '';

            response.on('data', (chunk) => {
                serverData += chunk;
            });

            response.on('end', ()  => {
                if(response.statusCode == 200) {
                    if (serverData != undefined) {
                        let field = JSON.parse(serverData);
                        let paths = field['geometry']['paths'][0];

                        let result  = {};
                        result[fid] = paths;
                        resolve(result);
                    }
                } else if(response.statusCode == 404) {
                    reject("Request field ID could not found in the mountain.");
                }
            });
        }).end();
    });
}