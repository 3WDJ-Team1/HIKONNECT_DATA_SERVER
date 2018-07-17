var express      = require('express');
var router       = express.Router();
var mysql        = require('mysql');
var fs           = require('fs');
var multiparty   = require('multiparty');
require('date-utils');

var picture_name = 'basic';

// DB Connect
var connection = mysql.createConnection({
    host     : '35.189.147.81',
    user     : 'ganbariya',
    password : '3wdjteam1',
    port     : '3306',
    database : 'hikonnect'
});

router.post('/regLocation',function (req, res) {
    // Get current time
    newDate = new Date();
    time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    var form = new multiparty.Form({
        autoFiles: true,
        uploadDir: 'public/images/LocationMemo'
    });
    var data = {};
    form.parse(req,function (err,fields,files) {
        if (fields.picture[0] == 'false') {
            data = {
                'schedule_no'       : fields.schedule_no[0],
                'title'             : fields.title[0],
                'content'           : fields.content[0],
                'writer'            : fields.writer[0],
                'picture'           : fields.picture[0],
                'created_at'        : time,
                'updated_at'        : time,
                'latitude'          : fields.latitude[0],
                'longitude'         : fields.longitude[0]
            };
            connection.query('insert into location_memo SET ?', data, function (err, rows) {
                if (err == undefined)
                    res.send('Success');
                else
                    console.log(err);
            });
        }
        else if (fields.picture[0] == 'true') {
            data = {
                'schedule_no'       : fields.schedule_no[0],
                'title'             : fields.title[0],
                'content'           : fields.content[0],
                'writer'            : fields.writer[0],
                'picture'           : fields.picture[0],
                'created_at'        : time,
                'updated_at'        : time,
                'latitude'          : fields.latitude[0],
                'longitude'         : fields.longitude[0]
            };
            connection.query('insert into location_memo SET ?', data, function (err, rows) {
                if (err == undefined)
                    res.send('Success');
                else
                    console.log(err);
            });
            connection.query('select * from location_memo where created_at = ?', time, function (err, rows) {
                var filename = `${rows[0]['no']}_${rows[0]['writer']}`;
                fs.rename(files.location[0].path, 'public/images/LocationMemo/' + filename + '.jpg', function (err) {
                    if (err) throw err;
                    console.log('Success');
                });
            });
        }
    });
});


router.post('/getLocationPic', function (req, res) {
    console.log(req);
    res.download('public\\images\\LocationMemo\\' + req.body.userid + '.jpg');
});
module.exports = router;