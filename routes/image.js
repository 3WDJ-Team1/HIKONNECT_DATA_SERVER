var express = require('express');
var router  = express.Router();
var multer  = require('multer');
var mysql   = require('mysql');
var fs      = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname == 'userfile')
            cb(null, 'public/images/UserProfile/');
        else if (file.fieldname == 'radio')
            cb(null, 'public/RadioFile/');
        else if (file.fieldname == 'announce')
            cb(null, 'public/images/Announce/');
    },
    filename: function (req, file, cb) {
        if (file.fieldname == 'userfile' || file.fieldname == 'announce')
            cb(null, file.originalname + ".jpg");
        else if (file.fieldname == 'radio')
            cb(null, req.body.filename + ".wav");
    }
});
var upload = multer({ storage: storage });
router.post('/profile', upload.single('userfile'), function (req, res) {
    res.send('Success');
});

var connection = mysql.createConnection({
    host     : '35.189.147.81',
    user     : 'ganbariya',
    password : '3wdjteam1',
    port     : '3306',
    database : 'hikonnect'
});
connection.connect();

router.post('/radio', upload.single('radio'), function (req, res) {
    res.send('Success');
});

router.post('/announce', upload.single('announce'), function (req, res) {

    connection.query('select * from announce order by no desc limit 1', function (err, rows) {
        var filename = `${rows[0]['no']}`;
        fs.rename(req.file.path, 'public/images/Announce/' + filename + '.jpg', function (err) {
            if (err) throw err;
            console.log('Success');
        });
    });
    res.send('Success');
    connection.end();
});


module.exports = router;