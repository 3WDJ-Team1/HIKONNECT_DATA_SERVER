var express = require('express');
var router  = express.Router();
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname == 'location')
            cb(null, 'public/images/LocationMemo/')
        else if (file.fieldname == 'userfile')
            cb(null, 'public/images/UserProfile/')
        else if (file.fieldname == 'radio')
            cb(null, 'public/RadioFile/')
    },
    filename: function (req, file, cb) {
        if (file.fieldname == 'userfile' || file.fieldname == 'location')
            cb(null, req.body.filename + ".jpg");
        else if (file.fieldname == 'radio')
            cb(null, req.body.filename + ".wav");
    }
});
var upload = multer({ storage: storage });
router.post('/profile', upload.single('userfile'), function (req, res) {
    res.send('Success');
});

router.post('/lm_pic', upload.single('location'), function (req, res) {
    res.send('Success');
});

router.post('/radio', upload.single('radio'), function (req, res) {
    res.send('Success');
});

router.post('/getProfile', function (req, res) {
    res.sendfile('C:\\Users\\송솔\\PhpstormProjects\\HIKONNECT_DATA_SERVER\\public\\images\\UserProfile\\' + req.query.userid + '.jpg');
});

router.post('/getLocationPic', function (req, res) {
    res.sendfile('C:\\Users\\송솔\\PhpstormProjects\\HIKONNECT_DATA_SERVER\\public\\images\\LocationMemo\\' + req.query.userid + '.jpg');
});

module.exports = router;