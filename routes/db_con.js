var mysql       = require('mysql');
var conn  = mysql.createConnection({
    host      : '35.189.147.81',
    port      : '3306',
    user      : 'ganbariya',
    password  : '3wdjteam1',
    database  : 'hikonnect'
});

conn.connect();
var sql = 'select * from user where nickname=?';
var params = ['테에스트']
conn.query(sql, params, function (err,rows,fields) {
    if(err) {
        console.log(err);
    } else{
        for(var i = 0; i < rows.length; i++) {
            console.log(rows);
        }
    }
});