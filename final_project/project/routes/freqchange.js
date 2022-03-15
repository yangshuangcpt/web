// 获取关键词 疫情 随日期变化的出现次数【折线图】
var nodejieba = require('nodejieba');

//正则表达式去掉一些无用的字符。
const regex_c = /[\t\s\r\n]|[\+\-\(\),\.。，！？《》@、【】"'：:%-\/“”]/g;
var regex_d = /\w{3}\s(.*?) 2021/; //只留下日期的年月
// var regex_d = /((\d{4}|\d{2})(\-|\/|\.)(\d{1,2})(\-|\/|\.)(\d{1,2}))|(\d{4}年\d{1,2}月\d{1,2}日)/
var freqchange = function(vals, keyword) {
    var regex_k = eval('/'+keyword+'/g');
    var word_freq = {};

    vals.forEach(function (data){
        var content = data["content"].replace(regex_c,'');
        var publish_date = regex_d.exec(data['publish_date'])[1];
        // console.log(content);
        var freq = content.match(regex_k).length;// 直接搜这个词。或者是先分词再统计词频（可自己尝试）
        word_freq[publish_date] = (word_freq[publish_date] + freq ) || 0;
    });
    return word_freq;
};
exports.freqchange = freqchange;


