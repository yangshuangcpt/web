var newsDAO = require('../dao/newsDAO');
var regDAO = require('../dao/regDAO');
var logDAO = require('../dao/logDAO');
var userDAO = require('../dao/userDAO');
var express = require('express');
var router = express.Router();

var mywordcutModule = require('./wordcut.js');
var myfreqchangeModule = require('./freqchange.js');


router.get('/search', function(request, response) {
    console.log(request.session['username']);
    //sql字符串和参数
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else {
        var param = request.query;
        newsDAO.search(param,function (err, result, fields) {
            response.json({message:'data',result:result});
        })
    }
});

router.get('/isadminer', function(request, response) {
    var username = request.session['username'];
    if (username===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else {
        regDAO.isnotadminer(username,function (result) {
            if(!(result.length == 0)){
                response.json({message:'ok'});
            }else{
                response.json({message:'你不是管理员，无权限查看'});
            }
            });
        }
    });

router.get('/userlog', function (request, response) {
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else{
        var param = request.query;
        logDAO.searchuserlog(param,function(result){
            if(!(result.length == 0)){
                // console.log(result);
                response.json({message:'ok',result:result});
            }else{
                response.json({message:'无此用户！'});
            }
        })
    }});

router.get('/searchname',function(request,response){
    console.log("whynohere2")
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else{
        console.log("here2")
        userDAO.searchallname(function(result){
            if(!(result.length == 0)){
                response.json({message:'ok',result:result});
            }else{
                response.json({message:'无用户！'});
            }
        })
    }
});

router.get('/stopregister', function(request,response){
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else {
        var param = request.query;
        regDAO.stopinsert(param,request.session['username'],function (err, result) {
            response.json({message: '成功关闭注册功能'});
        })
    }
});

router.get('/openregister',function(request,response){
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else {
        var param = request.query;
        regDAO.openinsert(param,request.session['username'],function (err, result) {
            response.json({message: '成功开启注册功能'});
        })
    }
});

router.get('/histogram', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        response.json({message:'url',result:'/index.html'});
    }else {
        var fetchSql = "select publish_date as x,count(publish_date) as y from eastmoney group by publish_date order by publish_date;";
        newsDAO.query_noparam(fetchSql, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:result}));
            response.end();
        });
    }
});


router.get('/pie', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    }else {
        var fetchSql = "select author as x,count(author) as y from eastmoney group by author;";
        newsDAO.query_noparam(fetchSql, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:result}));
            response.end();
        });
    }
});

router.get('/line', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    }else {
        var param = request.query;
        var keyword = param["keyword1"];
        var fetchSql = "select content,publish_date from eastmoney where content like'%" + keyword + "%' order by publish_date;";
        console.log(fetchSql);
        newsDAO.query_noparam(fetchSql, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:myfreqchangeModule.freqchange(result, keyword)}));
            response.end();
        });
    }
});

router.get('/wordcloud', function(request, response) {
    //sql字符串和参数
    console.log(request.session['username']);

    //sql字符串和参数
    if (request.session['username']===undefined) {
        // response.redirect('/index.html')
        response.json({message:'url',result:'/index.html'});
    }else {
        var fetchSql = "select content from eastmoney;";
        newsDAO.query_noparam(fetchSql, function (err, result, fields) {
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": 0
            });
            response.write(JSON.stringify({message:'data',result:mywordcutModule.wordcut(result)}));//返回处理过的数据
            response.end();
        });
    }
});


module.exports = router;
