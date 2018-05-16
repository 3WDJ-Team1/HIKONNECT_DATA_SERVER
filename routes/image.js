var express = require('express');
var router  = express.Router();
var multer  = require('multer');
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

router.post('/radio', upload.single('radio'), function (req, res) {
    res.send('Success');
});

router.post('/announce', upload.single('announce'), function (req, res) {
    res.send('Success');
});

module.exports = router;