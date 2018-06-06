var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : '35.189.147.81',
    user     : 'ganbariya',
    password : '3wdjteam1',
    port     : '3306',
    database : 'hikonnect'
});

var callbacks   = new Array();
var posistionSet = [
    {
        lat: 35.89636574,
        lng: 128.62048389
    },
    {
        lat: 35.89644396,
        lng: 128.62068774
    },
    {
        lat: 35.89647438,
        lng: 128.6208594
    },
    {
        lat: 35.89650045,
        lng: 128.62101497
    },
    {
        lat: 35.89651349,
        lng: 128.62114908
    },
    {
        lat: 35.89648742,
        lng: 128.62128319
    },
    {
        lat: 35.89646134,
        lng: 128.62142267
    },
    {
        lat: 35.89640485,
        lng: 128.62163724
    },
    {
        lat: 35.89637443,
        lng: 128.62181427
    },
    {
        lat: 35.89633967,
        lng: 128.62194301
    },
    {
        lat: 35.8963049,
        lng: 128.62209322
    },
    {
        lat: 35.89620495,
        lng: 128.62224879
    },
    {
        lat: 35.89608762,
        lng: 128.62237753
    },
    {
        lat: 35.89602244,
        lng: 128.62248482
    },
    {
        lat: 35.8959616,
        lng: 128.62255992
    },
    {
        lat: 35.89587034,
        lng: 128.62264575
    },
    {
        lat: 35.89578777,
        lng: 128.62273695
    },
];

var updatePosition = function(argMemberNo) {

    this.memberNo = argMemberNo;

    this.update = function() {

        let randVal = Math.round(Math.random() * 10);

        let lat         = posistionSet[randVal].lat;
        let lng         = posistionSet[randVal].lng;
        let distance    = Math.round(Math.random() * 100) / 10;

        let queryString = `
        UPDATE  schedule_member
        SET     latitude    = ${lat},
                longitude   = ${lng},
                distance    = ${distance}
        WHERE member_no = ${this.memberNo}
        ;`;

        connection.query(queryString, (err) => {
            if (err) console.error(err);
        });
    }
};

callbacks.push(new updatePosition(2));
callbacks.push(new updatePosition(3));
callbacks.push(new updatePosition(4));
callbacks.push(new updatePosition(5));
callbacks.push(new updatePosition(6));
callbacks.push(new updatePosition(7));
callbacks.push(new updatePosition(8));
callbacks.push(new updatePosition(10));

setInterval(() => {
    callbacks.every((val, idx) => {    
        val.update();
        return this;
    });
    console.log(Date.now() + " updated!!");
}, 1000);