// const url = require("url");
// const URL_DICT = require('./URL_DICT').URL_DICT
import URL_DICT from "./URL_DICT.js"

export function getURLS(search_word) {
    let urls_data = []
    for (let elem of URL_DICT){
        if (elem.word.toLowerCase() === search_word.toLowerCase()){
            urls_data.push({'id': elem.id, 'url': elem.url})
        }
    }
    return urls_data
}

// export function getURLS(search_word){
//     let word_urls = []
//     for (let i = 0 ; i < URL_DICT.length; i++){
//         if (URL_DICT[i].word.toLowerCase() == search_word.toLowerCase()){
//             // console.log(URL_DICT[i])
//             for (let url of URL_DICT[i].urls){
//                 word_urls.push(url.url)
//             }
//         }
//     }
//     console.log(word_urls)
//     if (word_urls){
//         return word_urls
//     } else {
//         return 0
//     }
// }

