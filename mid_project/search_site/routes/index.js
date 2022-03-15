var express = require('express');
var router = express.Router();
var mysql = require('../mysql.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/process_get1', function(request, response) {
    //sql字符串和参数
    if (!request.query.publish_date) {
        var fetchSql = "select url,source_name,title,publish_date " +
        "from eastmoney where title like '%" + request.query.title + "%' " + 
        "order by publish_date desc";
    }
    else{
        var fetchSql = "select url,source_name,title,publish_date " +
            "from eastmoney where title like '%" + request.query.title + "%' " + 
            "and publish_date like '" + request.query.publish_date + "' " +
            "order by publish_date desc";
    }
    mysql.query(fetchSql, function(err, result, fields) {
        for (var i=0;i<result.length;i++){
            result[i].publish_date = result[i].publish_date.toLocaleDateString()
        }
        response.writeHead(200, {
            "Content-Type": "application/json"
        });
        response.write(JSON.stringify(result));
        response.end();
    });
});

router.get('/process_get2', function(request, response) {
    //sql字符串和参数
    
    if (!request.query.publish_date1 && !request.query.publish_date2) {
        var fetchSql = "select publish_date ,COUNT(*) AS `num` " +
        "from eastmoney where content like '%" + request.query.content + "%' " + 
        "GROUP BY publish_date " + 
        "order by publish_date desc";
    }
    else if(!request.query.publish_date1){
        var fetchSql = "select publish_date ,COUNT(*) AS `num` " +
            "from eastmoney where content like '%" + request.query.content + "%' " + 
            "and date(publish_date) <= '" + request.query.publish_date2 + "' " +
            "GROUP BY publish_date " + 
            "order by publish_date desc";
    }
    else if(!request.query.publish_date2){
        var fetchSql = "select publish_date ,COUNT(*) AS `num` " +
            "from eastmoney where content like '%" + request.query.content + "%' " + 
            "and date(publish_date) >= '" + request.query.publish_date1 + "' " +
            "GROUP BY publish_date " + 
            "order by publish_date desc";
    }
    else{
        var fetchSql = "select publish_date ,COUNT(*) AS `num` " +
            "from eastmoney where content like '%" + request.query.content + "%' " + 
            "and date(publish_date) between '" + request.query.publish_date1 + "' and '" + request.query.publish_date2 + "' " +
            "GROUP BY publish_date " + 
            "order by publish_date desc";
    }
    
    mysql.query(fetchSql, function(err, result, fields) {
        for (var i=0;i<result.length;i++){
            result[i].publish_date = result[i].publish_date.toLocaleDateString()
        }
        response.writeHead(200, {
            "Content-Type": "application/json"
        });
        response.write(JSON.stringify(result));
        response.end();
    });
});
module.exports = router;
