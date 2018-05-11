var express = require('express');
var router  = express.Router();
var mysql   = require('mysql');
var multer  = require('multer');
require('date-utils');

//Regist Picture Information
var picture_name = '';
var storage      = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/LocationMemo/')
    },
    filename: function (req, file, cb) {
        cb(null, picture_name + ".jpg");
    }
});
var upload = multer({
    storage: storage
});

// DB Connect
var connection = mysql.createConnection({
    host     : '35.189.147.81',
    user     : 'ganbariya',
    password : '3wdjteam1',
    port     : '3306',
    database : 'hikonnect'
});
connection.connect();

router.post('/regLocation', function (req, res) {
    // Get current time.
    newDate  = new Date();
    time     = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

    var data = {
        'schedule_no'  : req.body.schedule_no,
        'hiking_group' : req.body.hiking_group,
        'title'        : req.body.title,
        'content'      : req.body.content,
        'writer'       : req.body.writer,
        'picture'      : req.body.picture,
        'created_at'   : time,
        'updated_at'   : time,
        'latitude'     : req.body.latitude,
        'longitude'    : req.body.longitude
    };

    connection.query('insert into location_memo SET ?', data, function (err, rows) {
        res.send('Success');
    });
    connection.query('select * from location_memo where created_at = ?', time, function (err, rows) {
        picture_name = `${rows[0]['no']}_${rows[0]['writer']}_${time}`;

        console.log(filename);
    });
}, upload.single('location'));

router.post('/getLocationPic', function (req, res) {
    console.log(req);
    res.download('public\\images\\LocationMemo\\' + req.body.userid + '.jpg');
});

module.exports = router;