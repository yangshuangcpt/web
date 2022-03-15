// 用于存放用户操作记录  日志

//该文件没有用，最后选择使用express中间件 morgan记录日志（app.js中）
var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

// 记录用户操作
module.exports = {
    userlog :function (useraction, callback) {
        pool.query('insert into user_action(username,request_time,request_method,request_url,status,remote_addr) values(?, ?,?,?,?,?)',
            useraction, function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    searchuserlog: function (param,callback) {
        var sql = '';
        console.log(param.username)
        if(param.username != "undefined"){
            sql+= 'SELECT * from user_action where username = "'+param.username+'" ';
        }else{
            sql+= 'SELECT * from user_action '
        }
        if(param.sort!="undefined"){
            if(param.sort =="1"){
                sql+='ORDER BY request_time ASC ';
            }else {
                sql+='ORDER BY request_time DESC ';
            }
        }
        sql+=';' ;
        pool.query(sql, function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
};
