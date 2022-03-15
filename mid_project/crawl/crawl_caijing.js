var fs = require('fs');
var myRequest = require('request');
var myCheerio = require('cheerio');
var myIconv = require('iconv-lite');
require('date-utils');
var mysql = require('./mysql.js');

var source_name = "财经网";
var domain = 'https://www.caijing.com.cn/';
var myEncoding = "utf-8";
var seedURL = 'https://www.caijing.com.cn/';

var seedURL_format = "$('a')";
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")";
var description_format = "$('meta[name=\"description\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
// var date_format = "$('#pubtime_baidu').text()";
var date_format = "$('.news_time').text()";  //#是id，.是class
var content_format = "$('#the_content').text()";

var url_reg = /\https?:\/\/\w*[.]caijing[.]com[.]cn\/2021\d{2}\d{2}\/\d*.shtml/;
var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/

//防止网站屏蔽我们的爬虫
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
        timeout: 10000 //
    }
    myRequest(options, callback)
};

seedget();

function seedget() {
    request(seedURL, function(err, res, body) { //读取种子页面
        try {
            //用iconv转换编码
            var html = myIconv.decode(body, myEncoding);
            //console.log(html);
            //准备用cheerio解析html
            var $ = myCheerio.load(html, { decodeEntities: true });
        } catch (e) { console.log('读种子页面并转码出错：' + e); return; };
        var seedurl_news;
        try {
            seedurl_news = eval(seedURL_format);
        } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
        seedurl_news.each(function(i, e) { //遍历种子页面里所有的a链接
            var myURL = "";
            try {
                //得到具体新闻url
                var href = "";
                href = $(e).attr("href");
                if (href == undefined) return;
                if (href.toLowerCase().indexOf('http://') >= 0) myURL = href; //http://开头的
                else if (href.toLowerCase().indexOf('https://') >= 0) myURL = href; //https://开头的
                else return;

            } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e); return }
            
            if (!url_reg.test(myURL)) return; //检验是否符合新闻url的正则表达式
            

            var fetch_url_Sql = 'select url from eastmoney where url=?';
            var fetch_url_Sql_Params = [myURL];
            mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
                if (vals.length > 0) {
                    console.log('URL duplicate!')
                } else newsGet(myURL); //读取新闻页面
            });
        });
    });
};


function newsGet(myURL) { //读取新闻页面
    request(myURL, function(err, res, body) { //读取新闻页面
        //try {
        var html_news = myIconv.decode(body, myEncoding); //用iconv转换编码
        //console.log(html_news);
        //准备用cheerio解析html_news
        var $ = myCheerio.load(html_news, { decodeEntities: true });
        myhtml = html_news;
        //} catch (e) {    console.log('读新闻页面并转码出错：' + e);};

        console.log("转码读取成功:" + myURL);
        //动态执行format字符串，构建json对象准备写入文件或数据库
        var fetch = {};
        fetch.title = "";
        fetch.content = "";
        // fetch.publish_date = (new Date()).toFormat("YYYY-MM-DD");
        fetch.url = myURL;
        fetch.source_name = source_name;
        fetch.crawltime = new Date();

        if (keywords_format == "") fetch.keywords = "";
        else fetch.keywords = eval(keywords_format);

        if (description_format == "") fetch.description = "";
        else fetch.description = eval(description_format);

        if (title_format == "") fetch.title = "";
        else fetch.title = eval(title_format);

        if (content_format == "") fetch.content = "";
        else fetch.content = eval(content_format);

        if (date_format != "") {
            fetch.publish_date = eval(date_format); //刊登日期 
            if (!regExp.exec(fetch.publish_date))  return ;
            fetch.publish_date = regExp.exec(fetch.publish_date)[0];
            fetch.publish_date = fetch.publish_date.replace('年', '-');
            fetch.publish_date = fetch.publish_date.replace('月', '-');
            fetch.publish_date = fetch.publish_date.replace('日', '');
            fetch.publish_date = fetch.publish_date.replace('/', '-');
            fetch.publish_date = new Date(fetch.publish_date).toFormat("YYYY-MM-DD");
        }
        else return;

        // var filename = source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
        //     "_" + myURL.substr(myURL.lastIndexOf('/') + 1) + ".json";
        // ////存储json
        // fs.writeFileSync(filename, JSON.stringify(fetch));

        var fetchAddSql = 'INSERT INTO eastmoney(url,title,' +
            'keywords, source_name, description, publish_date,'+
            'crawltime,content) VALUES(?,?,?,?,?,?,?,?)';
        var fetchAddSql_Params = [fetch.url, fetch.title, 
            fetch.keywords, fetch.source_name, fetch.description, fetch.publish_date,
            fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content
        ];

        //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
        mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
            if (qerr) {
                console.log(qerr);
            }
        }); //mysql写入
    });
}
