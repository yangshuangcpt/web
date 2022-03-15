

# Node.JS新闻网站爬虫、并实现爬取结果查询

（如果图片加载不出来，请连接外网vpn，或者进入我的github项目中查看images文件夹）

## 新闻网站爬取

​	本项目爬取的网站为**东方财富**和**财经网**，集中在4.27日-4.29日三天的傍晚进行网页爬取，总共爬取了649条有效网站，并将新闻网站内容进行解析，选取了网站链接、新闻标题、关键词、网站来源、摘要、发布时间、爬取时间、新闻内容存储于**Mysql**数据库中。

#### 引用的模块

##### request模块

​	该模块在读取种子页面，遍历新闻链接的时候和读取新闻链接的时候时使用。该模块使http请求变得更简单。

##### iconv-lite模块

​	该模块的作用就是转码，用iconv-lite.decode( )转码，可以设置成’utf-8’，以规避乱码产生。

##### cheerio模块

​	该模块是爬虫中很重要的一个模块，其主要作用是加载你要访问的HTML页面，即把HTML页面翻译给处理器。有了它我们才能对网页做进一步处理操作。

#### 分析新闻页面

​	下方部分代码和图片是我对东方财富网网页内容进行解析的方式（全部代码可以到我的github项目中去看），首先要进入东方财富的主页（种子页面）读取所有新闻链接（子网页）这一过程需要使用正则表达式来帮助判断新闻链接是否合法。之后根据网页的源代码（源代码查看方式：Fn+F12）分析所有新闻页面，解析出结构化数据。

​	以下代码位于crawl_eastmoney.js文件中，是对东方财富网进行的爬取。而对财经网进行爬取的代码是在crawl_caijing.js中。对财经网的爬取与对东方财富网的爬取很类似，只是在网页链接的匹配和关键字的匹配上有所不同，在此就不展示了，具体可以看我的代码。create_table.sql主要是为了在数据库中创建数据表，mysql.js是为了在node.js中连接到数据库，这两个文件在后续会进行说明。

```
//$表示查找，如$('a')查找以a开头的子网页链接。‘#’表示查找的是id，‘.’表示查找的是class
var seedURL_format = "$('a')";
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")"; //eq（0）是从头开始把content的数据都取出来
var description_format = "$('meta[name=\"description\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
var date_format = "$('.time').text()";
var content_format = "$('.Body').text()";

//使用正则表达式选取合适的网页链接
var url_reg = /\https?:\/\/finance[.]eastmoney[.]com\/a\/\d*.html/;
//使用正则表达式选取网页发表时间
var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/
```

 	东方财富网站主网页（种子网页）上有很多链接，但是并非所有的链接都为新闻链接，也有一些链接是指向其他非新闻页面的。而我们的目的是找出所有新闻页面，所以需要对URL进行选择，通过观察发现，在东方财富网站中，所有新闻网站都是以http://finance.eastmoney.com/a/.....html的结构构成，所以根据此构造正则表达式来匹配这样的链接，从而筛掉其他非新闻链接。

​	然后在东方财富网主页并随机选择一个新闻网页进入其中，在控制台查看其源代码，找到title、keywords、description等关键字，根据其结构进行解析。

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619702126343.png) 

#### 将数据存储到MYSQL数据库

​	在爬取到新闻页面之后，需要把这些数据进行存储，考虑到放到数据库中便于进行之后的查找工作，本项目使用mysql数据库存储爬取的数据，如果没有安装mysql也可以使用sqlite来存取。连接数据库的方法是通过mysql.js文件，要记得修改其中的用户名和密码（一般都为root）。在插入数据之前，需要先创建一个数据库以及数据表，数据表中定义了表格的列名以及存储的数据类型，这一代码在create_table.sql中。然后通过crawl_eastmoney.js将数据写入到mysql数据库，具体的方式是通过mysql.query语句执行插入操作。

​	要注意，在爬取新闻页面之前，要查看该URL内容是否已经存储在数据库中了。

```
//一些简单的mysql语句
mysql -u root -p	//进入mysql
create database crawl;	//创建名为crawl的数据库
use crawl;			//切换到crawl数据库中
create table fetches....	//创建表格（该语句很长此处不完整）
show tables;		//查看当前数据库中的表格信息
drop table fetches;	//删除表格
select * from fetches;	//查询语句
```

```
//使用mysql语句将数据存储到数据库中
var fetchAddSql = 'INSERT INTO eastmoney(url,title,' +
	'keywords, source_name, description, publish_date,'+
	'crawltime,content) VALUES(?,?,?,?,?,?,?,?)';
var fetchAddSql_Params = [fetch.url, fetch.title, 
	fetch.keywords, fetch.source_name, fetch.description, fetch.publish_date,
	fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content];

//执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
if (qerr) {
console.log(qerr);
}
}); //mysql写入
```

```
//查询当前的URL是否已经在mysql数据库中了
var fetch_url_Sql = 'select url from eastmoney where url=?';
var fetch_url_Sql_Params = [myURL];
mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
    if (vals.length > 0) {
    	console.log('URL duplicate!')
    } else newsGet(myURL); //读取新闻页面
    });
```

​	把数据存入数据库之后可以通过Navicat查看mysql数据库中的内容，如果有乱码的话，可以修改解码方式，具体为utf-8还是GBK根据网页的不同而各异。我们可以在图片的右下角看到该表格中共有649条数据，也没有乱码，由此可见数据存储到数据库是成功的。

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619704779644.png) 

## 爬取结果查询与展示

​	此处的查询过程为：

- **在网页中输入/选择所需查询关键字并提交**
- **网页通过get方法传递参数给HTML文件，HTML文件进行解析并将参数交给node.js**
- **node.js连接到后端的mysql数据库进行语句查询**
- **node.js将查询结果返回给HTML文件，HTML以表格的形式展示到网页当中，并使用css进行美化。**

​	爬取结果的查询其实可以直接在数据库中进行查询，但是考虑到在mysql数据库中直接查询需要会sql语句才能进行，不便于操作也不美观，所以本项目使用express脚手架来创建一个网站框架，具体框架如下所示。可以根据用户在网页中输入/选择的标题和时间进行新闻查询，并且能够将查询结果分页显示，此外还使用了css对网页进行了一定程度的美化。*其中，标题的查询是只要包含查询词就会予以显示，不必输入完整的标题。标题和时间都并非必填项，如果用户不输入该项，则会放弃对该项进行筛选，如果所有查询项都不输入，则会返回数据库中所有结果。*

```
bin
 www			启动文件
public			静态资源文件目录，该文件夹下不需要映射可以直接访问
 search.html	功能为查询爬取结果
 time.html		功能为时间热度分析
 style.css		美化页面
routes			路由文件,以指定的http请求方式暴露给用户，并在用户请求后将结果返回
 index.js
 users.js
views			视图文件
app.js			初始化文件，引入依赖项
mysql.js		连接mysql
```

​	由于express脚手架已经搭建好了前后端的基本框架，我们在此基础上进行路由的修改、功能的实现以及美化即可。需要进行更改的文件有index.js, search.html, time.html, style.css。下面将附上index.js, search.html, style.css的代码，time.html会在时间热度分析时附上。

#### index.js

​	index.js的主要功能是接收从search.html中传入的参数（如标题的参数为request.query.title），然后根据参数进行sql语句的查询，并将查询结果通过response返回给search.html。此处主要实现的是对标题和时间两个字段的查询。需要注意的一个问题是，用户在前端页面查询时可能会空缺某个字段从而产生一些空值，可以通过修改sql查询语句或者通过if条件控制避免出错，并且达到不管哪些项为空值，都能进行查询（全为空则返回所有结果）。此外，在写sql语句时要注意，由于语句较长，往往需要分成几行写，每一行的末尾要记得加上空格，某些字段要记得加上引号，在写完sql语句之后最好先到数据库中尝试执行一下，执行成功之后再放入index.js文件中。

```
//index.js
var express = require('express');
var router = express.Router();
var mysql = require('../mysql.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
//与search.html相关联
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
//与time.html相关联
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
        console.log(fetchSql);
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


```

#### search.html

​	search.html需要提供一个表单到前端网页供用户输入查询参数，然后网页会将用户输入的参数进行返回给HTML(此处通过get方法), HTML解析参数并传递给index.js，最后将index.js返回的查询结果以表格的形式展现到网页中。以及，此处使用了bootstrap进行分页，但此处的代码框架并非我写，而是调用了网上已经写好的css和js文件完成了分页的功能并且以表格的形式进行显示。我写的不分页的代码在github项目代码中进行了注释，也可以很好的进行表格展示。

```
//search.html
<!DOCTYPE html>
<html>
<header>
    <link href="./style.css" rel="stylesheet" type="text/css"/>
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
    <link href="http://www.itxst.com/package/bootstrap-table-1.14.1/bootstrap-4.3.1/css/bootstrap.css" rel="stylesheet" />
    <link href="http://www.itxst.com/package/bootstrap-table-1.14.1/bootstrap-table-1.14.1/bootstrap-table.css" rel="stylesheet" />
    <script src="http://www.itxst.com/package/bootstrap-table-1.14.1/bootstrap-table-1.14.1/bootstrap-table.js"></script>
</header>

<body>
    <div class="notboot">财经新闻查询</div> 
    <div>
    <form>
        标题：<input type="text" name="title_text" id="query1"> 时间：<input type="date" name="publish_date" id="query2"> <input class="form-submit" type="button" value="查询">
    </form>
    </div>
    <table width="100%" id="record2"></table>
    <script>
        $(document).ready(function() {
            //点击查询按钮之后会进行以下操作
            $("input:button").click(function() {
                $.get('/process_get1?title=' + $("#query1").val() + '&publish_date=' + $("#query2").val(), function(data) {
                    $("#record2").bootstrapTable({
                    search:false,		//加上搜索控件						
                    method: 'get',		//请求方式
                    cache: false,       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                    pagination: true,   //是否显示分页（*）
                    sortable: true,    //是否启用排序
                    sortOrder: "asc",   //排序方式
                    striped: true,      //是否显示行间隔色
                    uniqueId: "url", //每一行的唯一标识，一般为主键列
                    pageSize: 5,        //每页的记录行数
                    sidePagination : 'client',              
                    columns:[{
                        field:'url',
                        title:'链接'
                    },{
                        field:'source_name',
                        title:'来源'
                    },{
                        field:'title',
                        title:'标题'
                    },{
                        field:'publish_date',
                        title:'发表日期'
                    }],
                    data: data,
                    });
                });
            });

        });
    </script>
</body>

</html>
```

#### style.css	

​	style.css主要是为了美化html页面，就不放在此处浪费空间了。

#### 结果展示

​	在cmd中输入node bin/www，然后本地访问http://127.0.0.1:3000/search.html，即可看到结果。

分页之前

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619710028983.png)

分页之后（每页5项内容）

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619709736106.png)

如果不输入时间，则会将所有天包含该关键词的新闻都显示出来，并且按照发表日期进行排序，越晚发表的新闻越靠前（这一功能的实现会在下面进行说明）。

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619761922.png)

## 时间热度分析

​	本项目的时间热度分析是指，可以显示某个关键词在每一天中出现的次数，以此可以看出该词在哪天是热词在哪天无人问津，从而可以大概分析出每天的焦点事件是什么。其实词语热度分析采用图表更为合适，但是由于我只连续的爬取了3天网页，所有网页大都集中在这三天，其他天数的很少，图表也不能完全展示出其波动效果，所以使用了表格进行展示，如果长期爬取新闻的话，可以以折线图的方式展现词语的时间热度。

​	此功能需要新增time.html文件并修改index.js和css文件，index.js在前文已经进行了展示，就不再此陈列了，但有一点值得注意，由于时间数据在mysql数据库中和网页中是按照不同的时区时间的，所以日期可能会不一致，如下图所示，所以在从数据库中取出时间数据的时候，需要使用.toLocaleDateString()函数，将时间数据变成字符串，从而使得前后端时间数据一致。

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/diftime.jpg)

​	下面主要介绍time.html的功能，该文件同search.html的框架一样，也是将网页的输入参数传递给index.js然后将index.js返回的结果返回到网页中，它需要提供一个表单到前端网页供用户输入参数，然后将结果以表格的形式返回。表格的内容为该关键词在每一天出现的次数。

​	考虑到时间越靠近现在，信息就越重要，所以表格按照时间顺序进行展示，发表时间越晚（越靠近现在）就越靠前。这一功能在index.js中进行实现，主要是通过在sql查询语句中增加"order by publish_date desc"这一语句进行排序。

#### time.html

```
<!DOCTYPE html>
<html>
<header>
    <link href="./style.css" rel="stylesheet" type="text/css"/>
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>
</header>

<body>
    <div class="notboot">财经新闻时间热点查询</div>
    <div>
    <form>
        <br> 查询标题：<input type="text" name="title_text" id="query1">
        <br> 开始时间：<input type="date" name="publish_date1" id="query2"> 
        <br> 结束时间：<input type="date" name="publish_date2" id="query3">
        <br> <input class="form-submit" type="button" value="查询">
    </form>
    </div>
    <div class="cardLayout" style="margin: 10px 0px">
        <table id="record3" class="tabtop13"></table>
    </div>
    <script>
        $(document).ready(function() {
            //点击查询按钮之后会进行以下操作
            $("input:button").click(function() {
                $.get('/process_get2?title=' + $("#query1").val() + '&publish_date1=' + $("#query2").val() + '&publish_date2=' + $("#query3").val(), function(data) {
                    $("#record3").empty();
                    $("#record3").append('<tr><th>publish_date</th><th>number</th></tr>');
                    for (let list of data) {
                        let table = '<tr>';
                        Object.values(list).forEach(element => {
                            table += ('<td>'+ element + '</td>');
                        });
                        $("#record3").append(table + '</tr>');
                    }
                });
            });

        });
    </script>
</body>

</html>
```



#### 结果展示

​	最开始我是按照标题进行关键词匹配的，但是考虑到标题的字数有限，很多有意义的词语都没有包含在内，所以改为按照文章内容进行关键词匹配，只要文章中出现了该词语，则为该词贡献了热度，这也符合我们的生活常识。由以下两张图可以看出，用内容匹配出的结果要多很多。

​	在cmd中输入node bin/www，然后本地访问http://127.0.0.1:3000/time.html，即可看到结果。

按照标题进行关键词匹配：（表格按照发表日期进行排序）

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619752645.png)

按照文章内容进行关键词匹配：

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619752267.png)

输入标题和开始结束时间后：

![Images](https://github.com/yangshuangcpt/web/raw/main/mid_project/images/1619752496.png)

#### 总结

​	通过本次实验，我知道了如何通过node.js进行爬虫，并在研究html页面时对标签有了进一步的了解，也学会使用正则表达式匹配合适的文字与链接。此外我还了解到网站前后端的框架是怎样的，用户在网页中输入的参数是如何被HTML进行解析并传递到node.js中的，然后又是怎样通过node.js与mysql数据库进行连接并对数据进行存储或查询的，以及从数据库中得到的数据是怎样传回到HTML并在页面以特定的格式进行显示的。此外，我还学会使用css文件对html文件进行美化，对前端有了更进一步的了解。

