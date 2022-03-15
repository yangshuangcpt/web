var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

module.exports = {
    add: function (user, callback) {
        pool.query('insert into user(username, password) values(?, ?)', [user.username, user.password], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    getByUsername: function (username, callback) {
        pool.query('select username, password from user where username = ?', [username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    searchallname: function (callback) {
        console.log("here3")
        pool.query('select username, registertime from user;', function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },

};
