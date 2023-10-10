const url = require("url");
const URL_DICT = require('./URL_DICT').URL_DICT

module.exports.getURLS = function (search_word){
    let word_urls = []
    for (let i = 0 ; i < URL_DICT.length; i++){
        if (URL_DICT[i].word.toLowerCase() == search_word.toLowerCase()){
            // console.log(URL_DICT[i])
            for (let url of URL_DICT[i].urls){
                word_urls.push(url.url)
            }
        }
    }
    console.log(word_urls)
    if (word_urls){
        return word_urls
    } else {
        return 0
    }
    // return word_urls
}

