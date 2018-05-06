var express = require('express');
var router = express.Router();
var fs = require('fs');
var http = require('http');

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

router.get('/getCurrentFID', function(req, res, next) {
    if(req.query.length != 4) {
        return res.sendStatus(400);
    }

    var reqMntCode  = req.query.mntCode;
    var reqFidSet   = Array.from(JSON.parse(req.query.fidSet));
    var reqLat      = req.query.lat;
    var reqLng      = req.query.lng;

    var hikingRoute = {};

    var httpResult = reqFidSet.map((val, idx) => {
        return new Promise((resolve, reject) => {
            resolve(httpTask(val));
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
    });

    function httpTask(reqFid) {
        return new Promise((resolve, reject) => {
            let options = {
                host: 'localhost',
                port: 3000,
                path: `/paths/${reqMntCode}/${reqFid}`,
            }

            http.request(options, (response) => {
                if(response.statusCode == 200) {
                    var serverData = '';

                    response.on('data', (chunk) => {
                        serverData += chunk;
                    });

                    response.on('end', () => {
                        let field = JSON.parse(serverData);
                        let paths = field['geometry']['paths'][0];

                        let result = {};
                        result[reqFid] = paths;
                        resolve(result);
                    });
                } else {
                    console.error('Illegal Request');
                }
            }).end();
        });
    }

    function calcDistance(lat1, lon1, lat2, lon2) {

        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;

        dist = dist * 1.609344 * 1000;

        return dist
    }
});

module.exports = router;

function distance(lat1, lon1, lat2, lon2) {
         
    let theta = lon1 - lon2;
    let dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) 
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