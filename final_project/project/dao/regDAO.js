var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

module.exports = {
    isnotadminer: function (username,callback) {
        pool.query('SELECT adminname from adminer where adminname = (?);',[username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },

    isregister: function (callback) {
        pool.query('SELECT action from admin where actiontime=(select MAX(actiontime) from admin);', function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    stopinsert: function (user,username, callback) {
        pool.query('insert into admin(action,adminname) values(?, ?)', [user.state, username], function (error, result) {
            // console.log("herestop");
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    openinsert:function (user, username, callback) {
        pool.query('insert into admin(action,adminname) values(?, ?)', [user.state, username], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
};
