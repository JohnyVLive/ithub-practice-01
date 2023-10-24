// const url = require("url");
// const URL_DICT = require('./URL_DICT').URL_DICT
import URL_DICT from "./URL_DICT.js"
// TODO: Реализовать подключения файла параметров для указания путей до ресурсов
const serverURL = 'http://localhost:63342'
export async function getURLS(search_word) {
    let urls_data = []
    for (let elem of URL_DICT){
        if (elem.word.toLowerCase() === search_word.toLowerCase()){
            urls_data.push({'id': elem.id, 'link': '&'+elem.link})
        }
    }
    return urls_data
}

export function getResourceFilename(id){
    const filename = URL_DICT.find((elem) => elem.id == id).link
    return filename
}

