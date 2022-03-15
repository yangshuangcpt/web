var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

module.exports = {
    query_noparam :function(sql, callback) {
        pool.getConnection(function(err, conn) {
            if (err) {
                callback(err, null, null);
            } else {
                conn.query(sql, function(qerr, vals, fields) {
                    conn.release(); //释放连接
                    callback(qerr, vals, fields); //事件驱动回调
                });
            }
        });
    },
    search :function(searchparam, callback) {
        // 组合查询条件
        var sql = 'select * from eastmoney ';
        var flag = 0;
        var time1 = searchparam["time1"]
        var time2 = searchparam["time2"]

        if( time1 != "null"){
            time1 = new Date(time1); 
            time1 = time1.getFullYear() + '-' + (time1.getMonth() + 1) + '-' + time1.getDate() + ' ' + time1.getHours() + ':' + time1.getMinutes() + ':' + time1.getSeconds();
        } 
        // time1=new Date(time1).getTime();
        if( time2 != "null"){
            time2 = new Date(time2); 
            time2 = time2.getFullYear() + '-' + (time2.getMonth() + 1) + '-' + time2.getDate() + ' ' + time2.getHours() + ':' + time2.getMinutes() + ':' + time2.getSeconds(); 
        }

        if(searchparam["t2"]!="undefined"){  //title1和title2都不为空
            sql +=(`where title like '%${searchparam["t1"]}%' ${searchparam['ts']} title like '%${searchparam["t2"]}%' `);
            flag = 1;
        }else if(searchparam["t1"]!="undefined"){  //title1不为空titile2为空
            sql +=(`where title like '%${searchparam["t1"]}%' `);
            flag = 1;
        };

        if(searchparam["t1"]=="undefined"&&searchparam["t2"]=="undefined"&&searchparam["c1"]!="undefined"){ //title为空 content不为空
            sql+='where ';
            flag = 1;
        }else if(searchparam["t1"]!="undefined"&&searchparam["c1"]!="undefined"){ //title不为空 content不为空
            sql+='and ';
            flag = 1;
        }

        if(searchparam["c2"]!="undefined"){ //content1和content2不为空
            sql +=(`content like '%${searchparam["c1"]}%' ${searchparam['cs']} content like '%${searchparam["c2"]}%' `);
        }else if(searchparam["c1"]!="undefined"){ //content1不为空content1为空
            sql +=(`content like '%${searchparam["c1"]}%' `);
        }

        if(flag == 0 &&(time1!= "null" || time2 != "null") ){    
            sql+='where ';
            flag = 1;
        }else if(flag == 1 && (time1!="null" || time2!="null")){ //前面不为空 后面不为空
            sql+='and ';
            flag = 1;
        }

        if(time1!="null" &&time2!="null" ){
            sql +=(`publish_date between '${time1}' and '${time2}' `);
        }else if(time1=="null" &&time2!="null" ){
            sql +=(`publish_date <= '${time2}' `);
        }else if(time1!="null" &&time2=="null" ){
            sql +=(`publish_date >= '${time1}' `);;
        }

        if(flag == 0 && searchparam["source"]!="undefined"){
            sql+=`where source_name like '%${searchparam["source"]}%' `;
        }else if(flag == 1 && searchparam["source"]!="undefined"){
            sql+=`and source_name like '%${searchparam["source"]}%' `;
        }

        if(searchparam['stime']!="undefined"){
            if(searchparam['stime']=="1"){
                sql+='ORDER BY publish_date ASC ';
            }else {
                sql+='ORDER BY publish_date DESC ';
            }
        }

        sql+=';';
        console.log(sql);
        pool.getConnection(function(err, conn) {
            if (err) {
                callback(err, null, null);
            } else {
                conn.query(sql, function(qerr, vals, fields) {
                    if(vals != undefined){
                        for (var i=0;i<vals.length;i++){
                            vals[i].publish_date = vals[i].publish_date.toLocaleDateString()
                        }
                    }
                    conn.release(); //释放连接
                    callback(qerr, vals, fields); //事件驱动回调
                });
            }
        });
    },


};
